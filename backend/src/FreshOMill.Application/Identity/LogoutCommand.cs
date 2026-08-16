using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Application.Common.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Identity;

public sealed record LogoutCommand(string RefreshToken) : IRequest<Unit>;

/// <summary>Revokes the refresh token if it exists — silently no-ops for an unknown/already-revoked
/// token, since logging out is idempotent from the client's point of view.</summary>
public sealed class LogoutCommandHandler(IApplicationDbContext context, IDateTimeProvider dateTimeProvider)
    : IRequestHandler<LogoutCommand, Unit>
{
    public async Task<Unit> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = Sha256Hasher.Hash(request.RefreshToken);

        var existing = await context.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

        if (existing is not null && existing.RevokedAt is null)
        {
            existing.RevokedAt = dateTimeProvider.UtcNow;
            await context.SaveChangesAsync(cancellationToken);
        }

        return Unit.Value;
    }
}
