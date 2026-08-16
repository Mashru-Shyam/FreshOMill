using System.Net;
using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Domain.Contact;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FreshOMill.Application.Contact;

public sealed record SubmitContactMessageCommand(string Name, string Email, string? Phone, string Message) : IRequest;

public sealed class SubmitContactMessageCommandHandler(
    IApplicationDbContext context,
    IDateTimeProvider dateTimeProvider,
    IEmailService emailService,
    IOptions<ContactOptions> contactOptions,
    ILogger<SubmitContactMessageCommandHandler> logger)
    : IRequestHandler<SubmitContactMessageCommand>
{
    public async Task Handle(SubmitContactMessageCommand request, CancellationToken cancellationToken)
    {
        var message = new ContactMessage
        {
            Name = request.Name.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            Message = request.Message.Trim(),
            SubmittedAt = dateTimeProvider.UtcNow,
        };

        context.ContactMessages.Add(message);
        await context.SaveChangesAsync(cancellationToken);

        try
        {
            await emailService.SendAsync(
                new EmailMessage(contactOptions.Value.NotifyEmail, $"New Contact Us message from {message.Name}", BuildNotificationBody(message)),
                cancellationToken);
        }
        catch (Exception ex)
        {
            // The message is already saved — a notification-email hiccup shouldn't fail the
            // shopper-facing request. Logged so it's still visible operationally even without an
            // admin UI to browse ContactMessages yet.
            logger.LogWarning(ex, "Failed to send Contact Us notification email for message {ContactMessageId}.", message.Id);
        }
    }

    private static string BuildNotificationBody(ContactMessage message) =>
        $"""
        <p><strong>Name:</strong> {WebUtility.HtmlEncode(message.Name)}</p>
        <p><strong>Email:</strong> {WebUtility.HtmlEncode(message.Email)}</p>
        <p><strong>Phone:</strong> {WebUtility.HtmlEncode(message.Phone ?? "—")}</p>
        <p><strong>Message:</strong></p>
        <p>{WebUtility.HtmlEncode(message.Message).Replace("\n", "<br/>")}</p>
        """;
}
