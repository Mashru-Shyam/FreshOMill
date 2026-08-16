using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Application.Common.Security;
using FreshOMill.Domain.Identity;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Identity;

public sealed record VerifyOtpCommand(Guid ChallengeId, string Code) : IRequest<AuthResponseDto>;

public sealed class VerifyOtpCommandHandler(IApplicationDbContext context, ITokenService tokenService, IDateTimeProvider dateTimeProvider)
    : IRequestHandler<VerifyOtpCommand, AuthResponseDto>
{
    private const int MaxAttempts = 5;

    public async Task<AuthResponseDto> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
    {
        var challenge = await context.OtpChallenges
            .FirstOrDefaultAsync(c => c.Id == request.ChallengeId, cancellationToken);

        if (challenge is null)
        {
            throw new AuthenticationException("Invalid or expired code.");
        }

        if (challenge.ConsumedAt is not null)
        {
            throw new AuthenticationException("This code has already been used.");
        }

        if (challenge.ExpiresAt < dateTimeProvider.UtcNow)
        {
            throw new AuthenticationException("This code has expired.");
        }

        if (challenge.Attempts >= MaxAttempts)
        {
            throw new AuthenticationException("Too many incorrect attempts. Request a new code.");
        }

        if (Sha256Hasher.Hash(request.Code) != challenge.CodeHash)
        {
            challenge.Attempts++;
            await context.SaveChangesAsync(cancellationToken);
            throw new AuthenticationException("Incorrect code.");
        }

        challenge.ConsumedAt = dateTimeProvider.UtcNow;

        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == challenge.Email, cancellationToken);
        if (user is null)
        {
            user = new User { Email = challenge.Email };
            context.Users.Add(user);
        }

        var accessToken = tokenService.CreateAccessToken(new AuthenticatedUser(user.Id, user.Email));
        var refreshToken = tokenService.CreateRefreshToken();

        context.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = Sha256Hasher.Hash(refreshToken.Token),
            ExpiresAt = refreshToken.ExpiresAtUtc,
        });

        await context.SaveChangesAsync(cancellationToken);

        return new AuthResponseDto(
            accessToken.AccessToken,
            accessToken.ExpiresAtUtc,
            refreshToken.Token,
            refreshToken.ExpiresAtUtc,
            user.Email);
    }
}
