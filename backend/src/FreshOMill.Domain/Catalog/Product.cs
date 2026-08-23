using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Catalog;

public sealed class Product : BaseAuditableEntity<Guid>
{
    // See Identity/User.cs for why this self-assigns Id. Previously unnecessary — every Product
    // row came from CatalogSeedData's HasData seed until admin CRUD started creating rows at
    // runtime.
    public Product() => Id = Guid.NewGuid();

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

    /// <summary>Admin-controlled flag driving the Home page's Best Sellers rail — replaces the
    /// old hardcoded product-name list that used to live in the frontend's best-sellers.ts.</summary>
    public bool IsFeatured { get; set; }

    public List<ProductVariant> Variants { get; set; } = [];

    /// <summary>Full image gallery, ordered by <see cref="ProductImage.SortOrder"/> — the quick-add
    /// modal shows all of these. <see cref="ImageUrl"/> stays the single "primary" image every
    /// card/grid/search-result already renders, kept in sync with <c>Images[0]</c> by
    /// CreateProductCommand/UpdateProductCommand rather than derived here, so a product with zero
    /// uploaded images still has a well-defined (null) primary image instead of an index error.</summary>
    public List<ProductImage> Images { get; set; } = [];

    /// <summary>Recomputes <see cref="InStock"/> from the current variant stock levels — call
    /// after any change to a variant's <see cref="ProductVariant.StockQuantity"/>.</summary>
    public void RecalculateInStock() => InStock = Variants.Any(v => v.StockQuantity > 0);
}
