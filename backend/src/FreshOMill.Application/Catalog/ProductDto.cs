namespace FreshOMill.Application.Catalog;

public sealed record ProductVariantDto(string Label, decimal Price, int StockQuantity);

public sealed record ProductDto(
    string Slug,
    string Name,
    decimal Price,
    string Unit,
    string CategorySlug,
    string? ImageUrl,
    bool InStock,
    string Description,
    int Popularity,
    bool IsFeatured,
    IReadOnlyList<ProductVariantDto> Variants,
    IReadOnlyList<string> Images);
