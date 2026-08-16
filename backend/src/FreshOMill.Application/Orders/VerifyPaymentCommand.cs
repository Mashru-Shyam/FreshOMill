using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Application.Contact;
using FreshOMill.Domain.Orders;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FreshOMill.Application.Orders;

/// <summary>
/// Confirms payment from the client-side redirect after Razorpay Checkout closes — fast-path UX
/// so the shopper sees "Paid" immediately, but never trusted on its own: the signature is
/// verified against the gateway's secret before anything changes. The webhook
/// (<see cref="HandleRazorpayWebhookCommand"/>) is the actual source of truth and may beat this
/// call here, in which case this is just an idempotent no-op.
/// </summary>
public sealed record VerifyPaymentCommand(
    Guid OrderId,
    string RazorpayOrderId,
    string RazorpayPaymentId,
    string RazorpaySignature) : IRequest<OrderDto>;

public sealed class VerifyPaymentCommandHandler(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    IPaymentGatewayService paymentGateway,
    IDateTimeProvider dateTimeProvider,
    IEmailService emailService,
    IOptions<ContactOptions> contactOptions,
    ILogger<VerifyPaymentCommandHandler> logger)
    : IRequestHandler<VerifyPaymentCommand, OrderDto>
{
    public async Task<OrderDto> Handle(VerifyPaymentCommand request, CancellationToken cancellationToken)
    {
        var order = await context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException($"Order '{request.OrderId}' was not found.");

        if (order.Status == OrderStatus.Placed)
        {
            return OrderMapper.ToDto(order);
        }

        if (order.GatewayOrderId != request.RazorpayOrderId ||
            !paymentGateway.VerifyPaymentSignature(request.RazorpayOrderId, request.RazorpayPaymentId, request.RazorpaySignature))
        {
            throw new PaymentVerificationException("Payment signature could not be verified.");
        }

        order.Status = OrderStatus.Placed;
        order.GatewayPaymentId = request.RazorpayPaymentId;
        order.PaidAt = dateTimeProvider.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await OrderNotificationEmail.TrySendAsync(emailService, contactOptions.Value, order, logger, cancellationToken);

        return OrderMapper.ToDto(order);
    }
}
