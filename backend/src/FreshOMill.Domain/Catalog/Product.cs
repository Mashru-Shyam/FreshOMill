using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Catalog;

public sealed class Product : BaseAuditableEntity<Guid>
{
    public required string Slug { get; set; }

    public required string Name { get; set; }

    public required decimal Price { get; set; }

    public required string Unit { get; set; }

    public Guid CategoryId { get; set; }

    public Category? Category { get; set; }

    public string? ImageUrl { get; set; }

    /// <summary>Kept in sync with <see cref="Variants"/> — true whenever any variant still has
    /// stock, false once they've all sold out. Persisted (rather than always computed) so it can
    /// still be queried/filtered on without loading every variant.</summary>
    public bool InStock { get; set; }

    public required string Description { get; set; }

    /// <summary>Lower sorts first for the "bestselling"/"featured" sort options on Store.</summary>
    public int Popularity { get; set; }

    public List<ProductVariant> Variants { get; set; } = [];

    /// <summary>Recomputes <see cref="InStock"/> from the current variant stock levels — call
    /// after any change to a variant's <see cref="ProductVariant.StockQuantity"/>.</summary>
    public void RecalculateInStock() => InStock = Variants.Any(v => v.StockQuantity > 0);
}
