using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using FreshOMill.Application.Common.Interfaces;
using Microsoft.Extensions.Options;

namespace FreshOMill.Infrastructure.Email;

/// <summary>
/// Sends email via Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email) rather than raw
/// SMTP — Render's free web service tier blocks outbound traffic on SMTP ports (25/465/587), so an HTTPS-based
/// provider is the only option that works without upgrading the hosting plan.
/// </summary>
public sealed class ResendEmailService(HttpClient httpClient, IOptions<EmailOptions> emailOptions, IOptions<ResendOptions> resendOptions)
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
        response.EnsureSuccessStatusCode();
    }

    private sealed record ResendSendRequest(
        [property: JsonPropertyName("from")] string From,
        [property: JsonPropertyName("to")] string[] To,
        [property: JsonPropertyName("subject")] string Subject,
        [property: JsonPropertyName("html")] string Html);
}
