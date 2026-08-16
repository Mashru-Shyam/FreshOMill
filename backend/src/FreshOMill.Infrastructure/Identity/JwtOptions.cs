namespace FreshOMill.Infrastructure.Identity;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    /// <summary>Base64-encoded HMAC-SHA256 signing key. Local dev: user-secrets. Prod: env var/secret store — never appsettings.json.</summary>
    public required string SigningKey { get; init; }

    public required string Issuer { get; init; }

    public required string Audience { get; init; }

    public int AccessTokenMinutes { get; init; } = 15;

    public int RefreshTokenDays { get; init; } = 30;
}
