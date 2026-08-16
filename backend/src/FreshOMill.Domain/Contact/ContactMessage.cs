using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Contact;

public sealed class ContactMessage : BaseAuditableEntity<Guid>
{
    // See Identity/User.cs for why this self-assigns Id.
    public ContactMessage() => Id = Guid.NewGuid();

    public required string Name { get; set; }

    public required string Email { get; set; }

    public string? Phone { get; set; }

    public required string Message { get; set; }

    public DateTimeOffset SubmittedAt { get; set; }
}
