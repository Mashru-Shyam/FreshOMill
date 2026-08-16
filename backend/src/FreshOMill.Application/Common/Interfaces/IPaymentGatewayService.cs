namespace FreshOMill.Application.Common.Interfaces;

public sealed record GatewayOrderResult(string GatewayOrderId, string Currency);

/// <summary>
/// Abstraction over the payment gateway (Razorpay, implemented in Infrastructure) — creates
/// gateway-side orders and verifies signatures for both the client-redirect callback and the
/// server-to-server webhook. Never trust a payment as successful without going through
/// <see cref="VerifyPaymentSignature"/> or <see cref="VerifyWebhookSignature"/> first.
/// </summary>
public interface IPaymentGatewayService
{
    /// <summary>The gateway's public key id — safe to hand to the frontend to open its checkout widget.</summary>
    string PublicKeyId { get; }

    Task<GatewayOrderResult> CreateOrderAsync(decimal amount, string receipt, CancellationToken cancellationToken = default);

    bool VerifyPaymentSignature(string gatewayOrderId, string gatewayPaymentId, string signature);

    bool VerifyWebhookSignature(string rawBody, string signature);
}
