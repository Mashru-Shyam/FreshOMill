using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Identity;

public sealed class RefreshToken : BaseAuditableEntity<Guid>
{
    // See User.cs for why this self-assigns Id.
    public RefreshToken() => Id = Guid.NewGuid();

    public Guid UserId { get; set; }

    public User? User { get; set; }

    /// <summary>SHA-256 hash of the opaque refresh token — never store the plaintext token.</summary>
    public required string TokenHash { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset? RevokedAt { get; set; }
}
