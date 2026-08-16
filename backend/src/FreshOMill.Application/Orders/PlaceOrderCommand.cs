using FreshOMill.Application.Cart;
using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Application.Contact;
using FreshOMill.Domain.Catalog;
using FreshOMill.Domain.Orders;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FreshOMill.Application.Orders;

public sealed record PlaceOrderItemInput(string? ProductSlug, string Name, string? ImageUrl, string Variant, decimal UnitPrice, int Qty);

/// <summary>
/// <paramref name="ClearCart"/> is set by the client depending on checkout mode: true for a
/// normal cart checkout, false for Buy-Now (buy-now.service.ts never touched the persisted cart,
/// so clearing it here would wipe out unrelated items the shopper still wants).
/// </summary>
public sealed record PlaceOrderCommand(
    string FullName,
    string Phone,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string Pincode,
    PaymentMethod PaymentMethod,
    IReadOnlyList<PlaceOrderItemInput> Items,
    bool ClearCart) : IRequest<OrderDto>;

public sealed class PlaceOrderCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    IDateTimeProvider dateTimeProvider,
    IPaymentGatewayService paymentGateway,
    IEmailService emailService,
    IOptions<ContactOptions> contactOptions,
    ILogger<PlaceOrderCommandHandler> logger)
    : IRequestHandler<PlaceOrderCommand, OrderDto>
{
    public async Task<OrderDto> Handle(PlaceOrderCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId!.Value;

        var products = await LoadCatalogProductsAsync(request.Items, cancellationToken);
        var items = ResolveAuthoritativePrices(request.Items, products);
        DecrementStock(items, products);

        var isOnlinePayment = request.PaymentMethod != PaymentMethod.Cod;

        var order = new Order
        {
            UserId = userId,
            PlacedAt = dateTimeProvider.UtcNow,
            Status = isOnlinePayment ? OrderStatus.PendingPayment : OrderStatus.Placed,
            PaymentMethod = request.PaymentMethod,
            Total = items.Sum(i => i.UnitPrice * i.Qty),
            ShippingFullName = request.FullName,
            ShippingPhone = request.Phone,
            ShippingAddressLine1 = request.AddressLine1,
            ShippingAddressLine2 = request.AddressLine2,
            ShippingCity = request.City,
            ShippingState = request.State,
            ShippingPincode = request.Pincode,
            Items = items
                .Select(i => new OrderItem
                {
                    ProductSlug = i.ProductSlug,
                    Name = i.Name,
                    ImageUrl = i.ImageUrl,
                    Variant = i.Variant,
                    UnitPrice = i.UnitPrice,
                    Qty = i.Qty,
                })
                .ToList(),
        };

        context.Orders.Add(order);

        if (request.ClearCart)
        {
            var cart = await CartHelpers.GetOrCreateCartAsync(context, userId, cancellationToken);
            context.CartLines.RemoveRange(cart.Lines);
            cart.Lines.Clear();
        }

        GatewayOrderResult? gatewayOrder = null;
        if (isOnlinePayment)
        {
            // order.Id is client-generated (see Order's constructor) so it exists as a receipt
            // reference before SaveChangesAsync — the gateway order and our row are created in
            // the same request, just not the same transaction as the gateway call itself.
            gatewayOrder = await paymentGateway.CreateOrderAsync(order.Total, order.Id.ToString(), cancellationToken);
            order.GatewayOrderId = gatewayOrder.GatewayOrderId;
        }

        await context.SaveChangesAsync(cancellationToken);

        // COD orders are Placed immediately (no payment step) — that's the only point this
        // handler ever reaches Placed itself. Online orders notify from VerifyPaymentCommand /
        // HandleRazorpayWebhookCommand instead, once payment is actually confirmed.
        if (!isOnlinePayment)
        {
            await OrderNotificationEmail.TrySendAsync(emailService, contactOptions.Value, order, logger, cancellationToken);
        }

        var dto = OrderMapper.ToDto(order);
        return gatewayOrder is null
            ? dto
            : dto with
            {
                PaymentGateway = new PaymentGatewayInfoDto(
                    paymentGateway.PublicKeyId,
                    gatewayOrder.GatewayOrderId,
                    gatewayOrder.Currency,
                    (long)Math.Round(order.Total * 100m, MidpointRounding.AwayFromZero)),
            };
    }

    private async Task<List<Product>> LoadCatalogProductsAsync(IReadOnlyList<PlaceOrderItemInput> items, CancellationToken cancellationToken)
    {
        var slugs = items.Where(i => i.ProductSlug is not null).Select(i => i.ProductSlug!).Distinct().ToList();
        if (slugs.Count == 0)
        {
            return [];
        }

        return await context.Products
            .Include(p => p.Variants)
            .Where(p => slugs.Contains(p.Slug))
            .ToListAsync(cancellationToken);
    }

    /// <summary>Overrides each line's UnitPrice with the catalog's real ProductVariant price
    /// whenever the slug/variant resolves to one — closes off a client-editable-price hole now
    /// that real payments are on the line. Lines with no catalog match keep the client-supplied
    /// price, same permissive fallback the rest of this pipeline already gives stale/unmatched
    /// cart snapshots.</summary>
    private static List<PlaceOrderItemInput> ResolveAuthoritativePrices(IReadOnlyList<PlaceOrderItemInput> items, List<Product> products) =>
        items
            .Select(item =>
            {
                var variant = products
                    .FirstOrDefault(p => p.Slug == item.ProductSlug)?
                    .Variants.FirstOrDefault(v => v.Label == item.Variant);
                return variant is null ? item : item with { UnitPrice = variant.Price };
            })
            .ToList();

    /// <summary>Decrements ProductVariant.StockQuantity for every line that resolves to a real
    /// catalog product/variant, flips Product.InStock off once a product's last variant sells
    /// out, and rejects the whole order (nothing saved — this runs before context.Orders.Add) if
    /// any line asks for more than is currently available. Lines with no ProductSlug/Variant
    /// match (e.g. a stale cart snapshot) are left untouched, same permissive trust the rest of
    /// the cart/order pipeline already gives client-supplied product references.</summary>
    private static void DecrementStock(List<PlaceOrderItemInput> items, List<Product> products)
    {
        var qtyBySlug = items
            .Where(i => i.ProductSlug is not null)
            .GroupBy(i => i.ProductSlug!)
            .ToDictionary(g => g.Key, g => g.GroupBy(i => i.Variant).ToDictionary(v => v.Key, v => v.Sum(i => i.Qty)));

        foreach (var product in products)
        {
            if (!qtyBySlug.TryGetValue(product.Slug, out var qtyByVariant))
            {
                continue;
            }

            foreach (var (variantLabel, qty) in qtyByVariant)
            {
                var variant = product.Variants.FirstOrDefault(v => v.Label == variantLabel);
                if (variant is null)
                {
                    continue;
                }
                if (variant.StockQuantity < qty)
                {
                    throw new InsufficientStockException(
                        $"Only {variant.StockQuantity} left of {product.Name} ({variant.Label}).");
                }
                variant.StockQuantity -= qty;
            }
            product.RecalculateInStock();
        }
    }
}
