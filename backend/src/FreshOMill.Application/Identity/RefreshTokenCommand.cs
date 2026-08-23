using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Application.Common.Security;
using FreshOMill.Domain.Identity;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Identity;

public sealed record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResponseDto>;

/// <summary>Standard refresh-token rotation: each use revokes the old row and issues a new pair.</summary>
public sealed class RefreshTokenCommandHandler(IApplicationDbContext context, ITokenService tokenService, IDateTimeProvider dateTimeProvider)
    : IRequestHandler<RefreshTokenCommand, AuthResponseDto>
{
    public async Task<AuthResponseDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = Sha256Hasher.Hash(request.RefreshToken);

        var existing = await context.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

        if (existing is null)
        {
            throw new AuthenticationException("Invalid refresh token.");
        }

        if (existing.RevokedAt is not null)
        {
            throw new AuthenticationException("This refresh token has been revoked.");
        }

        if (existing.ExpiresAt < dateTimeProvider.UtcNow)
        {
            throw new AuthenticationException("Refresh token has expired.");
        }

        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == existing.UserId, cancellationToken)
            ?? throw new AuthenticationException("User no longer exists.");

        existing.RevokedAt = dateTimeProvider.UtcNow;

        var accessToken = tokenService.CreateAccessToken(new AuthenticatedUser(user.Id, user.Email, user.Role));
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
            user.Email,
            user.Role);
    }
}
