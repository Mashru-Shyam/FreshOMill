using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Identity;

public sealed class User : BaseAuditableEntity<Guid>
{
    // Self-assigns Id so callers can just `new User { Email = ... }` — Id's setter is protected
    // (from BaseEntity), so it can only be set from inside the entity itself. EF Core overwrites
    // this with the real value when materializing an existing row from the database.
    public User() => Id = Guid.NewGuid();

    public required string Email { get; set; }
}
