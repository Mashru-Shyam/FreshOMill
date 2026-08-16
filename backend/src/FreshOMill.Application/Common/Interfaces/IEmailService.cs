namespace FreshOMill.Application.Common.Interfaces;

public sealed record EmailMessage(string ToAddress, string Subject, string HtmlBody, string? ToName = null);

/// <summary>Sends transactional email (OTP codes, Contact Us notifications). Implemented in Infrastructure via SMTP.</summary>
public interface IEmailService
{
    Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default);
}
