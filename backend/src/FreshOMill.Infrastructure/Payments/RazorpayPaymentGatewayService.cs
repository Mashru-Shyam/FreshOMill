using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using FreshOMill.Application.Common.Interfaces;
using Microsoft.Extensions.Options;

namespace FreshOMill.Infrastructure.Payments;

/// <summary>
/// Talks to Razorpay's REST API directly over HttpClient (Basic Auth with key id/secret) rather
/// than pulling in the official SDK — the order-create call and HMAC-SHA256 signature checks are
/// the only two things needed, both simple enough to keep transparent here.
/// See https://razorpay.com/docs/api/orders/ and https://razorpay.com/docs/payments/server-integration/php/payment-gateway/build-integration/#3-verify-payment-signature.
/// </summary>
public sealed class RazorpayPaymentGatewayService(HttpClient httpClient, IOptions<RazorpayOptions> options) : IPaymentGatewayService
{
    private readonly RazorpayOptions _options = options.Value;

    public string PublicKeyId => _options.KeyId;

    public async Task<GatewayOrderResult> CreateOrderAsync(decimal amount, string receipt, CancellationToken cancellationToken = default)
    {
        // Razorpay expects the amount as an integer in the smallest currency unit (paise for INR).
        var amountInPaise = (long)Math.Round(amount * 100m, MidpointRounding.AwayFromZero);

        using var request = new HttpRequestMessage(HttpMethod.Post, "orders")
        {
            Content = JsonContent.Create(new RazorpayCreateOrderRequest(amountInPaise, "INR", receipt)),
        };
        request.Headers.Authorization = BasicAuthHeader();

        using var response = await httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<RazorpayOrderResponse>(cancellationToken)
            ?? throw new InvalidOperationException("Razorpay returned an empty order response.");

        return new GatewayOrderResult(body.Id, body.Currency);
    }

    public bool VerifyPaymentSignature(string gatewayOrderId, string gatewayPaymentId, string signature) =>
        VerifyHmac($"{gatewayOrderId}|{gatewayPaymentId}", signature, _options.KeySecret);

    public bool VerifyWebhookSignature(string rawBody, string signature) =>
        VerifyHmac(rawBody, signature, _options.WebhookSecret);

    private static bool VerifyHmac(string payload, string signature, string secret)
    {
        var computedHash = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(payload));
        var computedSignature = Convert.ToHexStringLower(computedHash);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(computedSignature),
            Encoding.UTF8.GetBytes(signature.ToLowerInvariant()));
    }

    private AuthenticationHeaderValue BasicAuthHeader() =>
        new("Basic", Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_options.KeyId}:{_options.KeySecret}")));

    private sealed record RazorpayCreateOrderRequest(
        [property: JsonPropertyName("amount")] long Amount,
        [property: JsonPropertyName("currency")] string Currency,
        [property: JsonPropertyName("receipt")] string Receipt);

    private sealed record RazorpayOrderResponse(
        [property: JsonPropertyName("id")] string Id,
        [property: JsonPropertyName("currency")] string Currency);
}
