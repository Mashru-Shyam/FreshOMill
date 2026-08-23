using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Catalog;

/// <summary>One photo in a Product's gallery (see Product.Images) — the admin Products screen
/// lets an operator upload several of these per product, ordered by <see cref="SortOrder"/>.
/// The first one also becomes the product's single-image <see cref="Product.ImageUrl"/>, which
/// every existing card/grid/search-result view keeps using unchanged.</summary>
public sealed class ProductImage : BaseAuditableEntity<Guid>
{
    public ProductImage() => Id = Guid.NewGuid();

    public Guid ProductId { get; set; }

    public Product? Product { get; set; }

    public required string ImageUrl { get; set; }

    public int SortOrder { get; set; }
}
