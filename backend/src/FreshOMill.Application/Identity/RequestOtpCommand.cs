using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Application.Common.Security;
using FreshOMill.Domain.Identity;
using MediatR;

namespace FreshOMill.Application.Identity;

public sealed record RequestOtpCommand(string Email) : IRequest<RequestOtpResult>;

public sealed record RequestOtpResult(Guid ChallengeId, DateTimeOffset ExpiresAt);

public sealed class RequestOtpCommandHandler(
    IApplicationDbContext context,
    IDateTimeProvider dateTimeProvider,
    IEmailService emailService)
    : IRequestHandler<RequestOtpCommand, RequestOtpResult>
{
    private static readonly TimeSpan ChallengeLifetime = TimeSpan.FromMinutes(5);

    public async Task<RequestOtpResult> Handle(RequestOtpCommand request, CancellationToken cancellationToken)
    {
        var code = OtpCodeGenerator.Generate();
        var email = request.Email.Trim().ToLowerInvariant();
        var expiresAt = dateTimeProvider.UtcNow.Add(ChallengeLifetime);

        var challenge = new OtpChallenge
        {
            Email = email,
            CodeHash = Sha256Hasher.Hash(code),
            ExpiresAt = expiresAt,
        };

        context.OtpChallenges.Add(challenge);
        await context.SaveChangesAsync(cancellationToken);

        await emailService.SendAsync(
            new EmailMessage(email, "Your FreshOMill sign-in code", BuildOtpEmailBody(code)),
            cancellationToken);

        return new RequestOtpResult(challenge.Id, expiresAt);
    }

    private static string BuildOtpEmailBody(string code) =>
        $"""
        <p>Your FreshOMill sign-in code is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">{code}</p>
        <p>This code expires in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
        """;
}
