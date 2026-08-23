using System.Text.RegularExpressions;
using FreshOMill.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace FreshOMill.Infrastructure.Email;

/// <summary>
/// Used instead of ResendEmailService in Development (see DependencyInjection.AddInfrastructure) —
/// there's no real inbox to check locally, and Resend's sandbox restriction (undeliverable to any
/// address but the account's own signup one, or outright rejected without a configured API key)
/// was causing every local OTP request to fail with a 502 before this existed. Writes the OTP
/// code straight to the console log at Warning level so it's impossible to miss, and never touches
/// the network — local sign-in works with zero email provider configuration.
/// </summary>
public sealed partial class LoggingEmailService(ILogger<LoggingEmailService> logger) : IEmailService
{
    public Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        var code = message.Subject.Contains("sign-in code", StringComparison.OrdinalIgnoreCase)
            ? ExtractLikelyOtpCode(message.HtmlBody)
            : null;

        if (code is not null)
        {
            logger.LogWarning(
                "\n\n>>> DEV EMAIL — sign-in code for {ToAddress}: {Code} (expires in 5 minutes) <<<\n",
                message.ToAddress, code);
        }
        else
        {
            logger.LogInformation(
                "\n\n>>> DEV EMAIL to {ToAddress} — {Subject} <<<\n{Body}\n",
                message.ToAddress, message.Subject, message.HtmlBody);
        }

        return Task.CompletedTask;
    }

    // The OTP email body is authored by RequestOtpCommand.BuildOtpEmailBody() as a fixed
    // "<p style=...>{code}</p>" line — this pulls the digits back out so the log line can show
    // just the code on its own instead of the whole HTML body every time.
    private static string? ExtractLikelyOtpCode(string htmlBody)
    {
        var match = OtpDigits().Match(htmlBody);
        return match.Success ? match.Value : null;
    }

    [GeneratedRegex(@"\b\d{4,8}\b")]
    private static partial Regex OtpDigits();
}
