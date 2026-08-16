using System.Net;
using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Application.Contact;
using FreshOMill.Domain.Orders;
using Microsoft.Extensions.Logging;

namespace FreshOMill.Application.Orders;

/// <summary>
/// Sends the "you've got an order" email to the store's inbox (ContactOptions.NotifyEmail —
/// shared with Contact Us notifications, since it's the same one person reading both) once an
/// order reaches <see cref="OrderStatus.Placed"/>: immediately for COD (PlaceOrderCommand), or
/// once payment is confirmed for online orders (VerifyPaymentCommand / HandleRazorpayWebhookCommand,
/// whichever gets there first).
/// </summary>
internal static class OrderNotificationEmail
{
    /// <summary>Never throws — a notification-email hiccup shouldn't fail an already-placed,
    /// already-paid order, same reasoning as SubmitContactMessageCommand's own try/catch.</summary>
    public static async Task TrySendAsync(
        IEmailService emailService,
        ContactOptions contactOptions,
        Order order,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        try
        {
            await emailService.SendAsync(
                new EmailMessage(contactOptions.NotifyEmail, Subject(order), BuildBody(order)),
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to send new-order notification email for order {OrderId}.", order.Id);
        }
    }

    private static string Subject(Order order) =>
        order.PaymentMethod == PaymentMethod.Cod
            ? $"New COD order #{order.Id} — collect Rs. {order.Total:0.00}"
            : $"New order #{order.Id} — paid online, Rs. {order.Total:0.00}";

    private static string BuildBody(Order order)
    {
        var itemRows = string.Join(
            "",
            order.Items.Select(i =>
                $"""
                <tr>
                  <td>{WebUtility.HtmlEncode(i.Name)} ({WebUtility.HtmlEncode(i.Variant)})</td>
                  <td style="text-align:right">{i.Qty}</td>
                  <td style="text-align:right">Rs. {i.UnitPrice:0.00}</td>
                  <td style="text-align:right">Rs. {i.UnitPrice * i.Qty:0.00}</td>
                </tr>
                """));

        var addressLine2 = order.ShippingAddressLine2 is { } line2 ? $", {WebUtility.HtmlEncode(line2)}" : "";
        var paymentNote = order.PaymentMethod == PaymentMethod.Cod
            ? "Cash on Delivery — collect payment on drop-off."
            : "Paid online — no cash collection needed.";

        return $"""
            <p><strong>Order #{order.Id}</strong> — {WebUtility.HtmlEncode(paymentNote)}</p>
            <p><strong>Customer:</strong> {WebUtility.HtmlEncode(order.ShippingFullName)} — {WebUtility.HtmlEncode(order.ShippingPhone)}</p>
            <p><strong>Deliver to:</strong><br/>
            {WebUtility.HtmlEncode(order.ShippingAddressLine1)}{addressLine2}<br/>
            {WebUtility.HtmlEncode(order.ShippingCity)}, {WebUtility.HtmlEncode(order.ShippingState)} {WebUtility.HtmlEncode(order.ShippingPincode)}</p>
            <table cellpadding="6" style="border-collapse: collapse;">
              <thead><tr><th align="left">Item</th><th>Qty</th><th>Price</th><th>Line total</th></tr></thead>
              <tbody>{itemRows}</tbody>
            </table>
            <p style="font-size: 18px;"><strong>Total: Rs. {order.Total:0.00}</strong></p>
            """;
    }
}
