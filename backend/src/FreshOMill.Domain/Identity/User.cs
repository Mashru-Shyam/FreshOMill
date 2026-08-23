using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Identity;

public sealed class User : BaseAuditableEntity<Guid>
{
    // Self-assigns Id so callers can just `new User { Email = ... }` — Id's setter is protected
    // (from BaseEntity), so it can only be set from inside the entity itself. EF Core overwrites
    // this with the real value when materializing an existing row from the database.
    public User() => Id = Guid.NewGuid();

    public required string Email { get; set; }

    /// <summary>"Customer" or "Admin" — checked into the JWT as a role claim on every login/refresh.
    /// Granted automatically on OTP verification when the email matches the configured
    /// <c>Admin:Emails</c> allow-list (see VerifyOtpCommandHandler); there is no in-app "make
    /// admin" action yet since only one operator exists at this stage.</summary>
    public string Role { get; set; } = "Customer";
}
