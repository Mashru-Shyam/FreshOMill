using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Orders;

/// <summary>Same denormalized-snapshot rationale as Cart/CartLine.cs.</summary>
public sealed class OrderItem : BaseAuditableEntity<Guid>
{
    // See Identity/User.cs for why this self-assigns Id.
    public OrderItem() => Id = Guid.NewGuid();

    public Guid OrderId { get; set; }

    public string? ProductSlug { get; set; }

    public required string Name { get; set; }

    public string? ImageUrl { get; set; }

    public required string Variant { get; set; }

    public required decimal UnitPrice { get; set; }

    public int Qty { get; set; }
}
