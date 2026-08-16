using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Addresses;

public sealed class Address : BaseAuditableEntity<Guid>
{
    // See Identity/User.cs for why this self-assigns Id.
    public Address() => Id = Guid.NewGuid();

    public Guid UserId { get; set; }

    public required string FullName { get; set; }

    public required string Phone { get; set; }

    public required string AddressLine1 { get; set; }

    public string? AddressLine2 { get; set; }

    public required string City { get; set; }

    public required string State { get; set; }

    public required string Pincode { get; set; }

    public bool IsDefault { get; set; }
}
