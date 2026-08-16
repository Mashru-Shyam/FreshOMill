using System.Text.Json;
using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Application.Contact;
using FreshOMill.Domain.Orders;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FreshOMill.Application.Orders;

/// <summary>
/// Handles Razorpay's server-to-server webhook (configured in the Razorpay dashboard to POST
/// /api/v1/payments/webhook) — the authoritative record of a payment's outcome, independent of
/// whether the shopper's browser ever made it back to <see cref="VerifyPaymentCommand"/> (tab
/// closed, network drop, etc). Endpoint is intentionally unauthenticated (Razorpay isn't a
/// signed-in user); <see cref="RawBody"/>'s HMAC signature is what proves this call is genuine.
/// </summary>
public sealed record HandleRazorpayWebhookCommand(string RawBody, string Signature) : IRequest;

public sealed class HandleRazorpayWebhookCommandHandler(
    IApplicationDbContext context,
    IPaymentGatewayService paymentGateway,
    IDateTimeProvider dateTimeProvider,
    IEmailService emailService,
    IOptions<ContactOptions> contactOptions,
    ILogger<HandleRazorpayWebhookCommandHandler> logger)
    : IRequestHandler<HandleRazorpayWebhookCommand>
{
    public async Task Handle(HandleRazorpayWebhookCommand request, CancellationToken cancellationToken)
    {
        if (!paymentGateway.VerifyWebhookSignature(request.RawBody, request.Signature))
        {
            logger.LogWarning("Rejected a Razorpay webhook call with an invalid signature.");
            return;
        }

        using var json = JsonDocument.Parse(request.RawBody);
        var root = json.RootElement;
        var eventName = root.GetProperty("event").GetString();
        var payment = root.GetProperty("payload").GetProperty("payment").GetProperty("entity");
        var gatewayOrderId = payment.GetProperty("order_id").GetString();
        var gatewayPaymentId = payment.GetProperty("id").GetString();

        var order = await context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.GatewayOrderId == gatewayOrderId, cancellationToken);
        if (order is null || order.Status != OrderStatus.PendingPayment)
        {
            // Unknown order, or already resolved by an earlier webhook delivery / the client
            // verify call — Razorpay retries webhooks, so this must stay a no-op, not an error.
            return;
        }

        switch (eventName)
        {
            case "payment.captured":
                order.Status = OrderStatus.Placed;
                order.GatewayPaymentId = gatewayPaymentId;
                order.PaidAt = dateTimeProvider.UtcNow;
                break;
            case "payment.failed":
                order.Status = OrderStatus.PaymentFailed;
                await RestockAsync(order, cancellationToken);
                break;
            default:
                return;
        }

        await context.SaveChangesAsync(cancellationToken);

        if (order.Status == OrderStatus.Placed)
        {
            await OrderNotificationEmail.TrySendAsync(emailService, contactOptions.Value, order, logger, cancellationToken);
        }
    }

    /// <summary>Reverses PlaceOrderCommand's stock decrement for an order whose payment never
    /// went through — mirror image of that handler's DecrementStock, just adding instead of
    /// subtracting and never throwing (there's nothing to reject at this point).</summary>
    private async Task RestockAsync(Order order, CancellationToken cancellationToken)
    {
        var qtyBySlug = order.Items
            .Where(i => i.ProductSlug is not null)
            .GroupBy(i => i.ProductSlug!)
            .ToDictionary(g => g.Key, g => g.GroupBy(i => i.Variant).ToDictionary(v => v.Key, v => v.Sum(i => i.Qty)));

        if (qtyBySlug.Count == 0)
        {
            return;
        }

        var products = await context.Products
            .Include(p => p.Variants)
            .Where(p => qtyBySlug.Keys.Contains(p.Slug))
            .ToListAsync(cancellationToken);

        foreach (var product in products)
        {
            foreach (var (variantLabel, qty) in qtyBySlug[product.Slug])
            {
                var variant = product.Variants.FirstOrDefault(v => v.Label == variantLabel);
                if (variant is null)
                {
                    continue;
                }
                variant.StockQuantity += qty;
            }
            product.RecalculateInStock();
        }
    }
}
