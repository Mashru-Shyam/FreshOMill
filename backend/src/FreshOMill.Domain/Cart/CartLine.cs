using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Cart;

/// <summary>
/// A denormalized snapshot, not a live join to Product — the name/image/variant label are
/// whatever the client sent (same as the old localStorage-backed CartService), but UnitPrice is
/// overwritten server-side with the authoritative ProductVariant price whenever the line resolves
/// to a known (ProductSlug, Variant) pair — see AddCartLineCommandHandler.
/// </summary>
public sealed class CartLine : BaseAuditableEntity<Guid>
{
    // See Identity/User.cs for why this self-assigns Id.
    public CartLine() => Id = Guid.NewGuid();

    public Guid CartId { get; set; }

    /// <summary>Informational only (traceability) — not used to resolve price/name.</summary>
    public string? ProductSlug { get; set; }

    public required string Name { get; set; }

    public string? ImageUrl { get; set; }

    public required string Variant { get; set; }

    public required decimal UnitPrice { get; set; }

    public int Qty { get; set; }
}
