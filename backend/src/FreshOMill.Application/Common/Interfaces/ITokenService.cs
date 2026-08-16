namespace FreshOMill.Application.Common.Interfaces;

/// <summary>
/// Minimal claims needed to mint tokens. Populated from the Identity module's User entity once it exists.
/// </summary>
public sealed record AuthenticatedUser(Guid UserId, string Email);

public sealed record AccessTokenResult(string AccessToken, DateTimeOffset ExpiresAtUtc);

public sealed record RefreshTokenResult(string Token, DateTimeOffset ExpiresAtUtc);

/// <summary>
/// Issues JWT access tokens and opaque refresh tokens for the passwordless email-OTP auth flow.
/// Storing/rotating/revoking refresh tokens against the database is the Identity module's job (follow-up task);
/// this service only mints the token values.
/// </summary>
public interface ITokenService
{
    AccessTokenResult CreateAccessToken(AuthenticatedUser user);

    RefreshTokenResult CreateRefreshToken();
}
