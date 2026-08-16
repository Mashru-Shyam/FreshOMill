using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Identity;

public sealed class OtpChallenge : BaseAuditableEntity<Guid>
{
    // See User.cs for why this self-assigns Id.
    public OtpChallenge() => Id = Guid.NewGuid();

    public required string Email { get; set; }

    /// <summary>SHA-256 hash of the 6-digit code — never store the plaintext code.</summary>
    public required string CodeHash { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset? ConsumedAt { get; set; }

    /// <summary>Failed verify attempts against this challenge — locked out after 5.</summary>
    public int Attempts { get; set; }
}
