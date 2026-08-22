using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FreshOMill.Infrastructure.Email;

/// <summary>
/// Sends email via Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email) rather than raw
/// SMTP — Render's free web service tier blocks outbound traffic on SMTP ports (25/465/587), so an HTTPS-based
/// provider is the only option that works without upgrading the hosting plan.
/// </summary>
public sealed class ResendEmailService(
    HttpClient httpClient,
    IOptions<EmailOptions> emailOptions,
    IOptions<ResendOptions> resendOptions,
    ILogger<ResendEmailService> logger)
    : IEmailService
{
    private readonly EmailOptions _emailOptions = emailOptions.Value;
    private readonly ResendOptions _resendOptions = resendOptions.Value;

    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "emails")
        {
            Content = JsonContent.Create(new ResendSendRequest(
                $"{_emailOptions.FromName} <{_emailOptions.FromAddress}>",
                [message.ToAddress],
                message.Subject,
                message.HtmlBody)),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _resendOptions.ApiKey);

        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            // Never surface the raw provider response to the caller — on a sandbox/unverified-
            // domain Resend account this commonly includes the account's own email address (the
            // only address it's allowed to deliver to), which a sign-in form has no business
            // leaking to whoever typed in an email. Full detail goes to the log only; the
            // exception message is the generic, safe one GlobalExceptionHandler shows the client.
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError(
                "Resend rejected sending to {ToAddress}: {StatusCode} {Body}",
                message.ToAddress, (int)response.StatusCode, body);
            throw new EmailDeliveryException("Could not send the email right now. Please try again shortly.");
        }
    }

    private sealed record ResendSendRequest(
        [property: JsonPropertyName("from")] string From,
        [property: JsonPropertyName("to")] string[] To,
        [property: JsonPropertyName("subject")] string Subject,
        [property: JsonPropertyName("html")] string Html);
}
