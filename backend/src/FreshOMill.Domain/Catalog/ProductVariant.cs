using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Catalog;

/// <summary>
/// A purchasable pack size of a Product (e.g. "500g" / "1kg" for a flour, "500ml" / "1L" for an
/// oil) — each with its own price and stock. Replaces the old client-side fabrication
/// (frontend's deriveWeightVariants()/stockCountFor(), which invented a second pack size and a
/// fake stock count from a name hash instead of reading real data).
/// </summary>
public sealed class ProductVariant : BaseAuditableEntity<Guid>
{
    // See Identity/User.cs for why this self-assigns Id.
    public ProductVariant() => Id = Guid.NewGuid();

    public Guid ProductId { get; set; }

    public Product? Product { get; set; }

    public required string Label { get; set; }

    public required decimal Price { get; set; }

    public int StockQuantity { get; set; }

    /// <summary>Lower sorts first — keeps the smallest pack size shown/selected by default.</summary>
    public int SortOrder { get; set; }
}
