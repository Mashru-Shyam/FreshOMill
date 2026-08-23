namespace FreshOMill.Application.Catalog.Admin;

public sealed record AdminProductVariantDto(Guid Id, string Label, decimal Price, int StockQuantity, int SortOrder);

/// <summary>Admin-facing equivalent of ProductDto — carries real Ids (Product.Id, CategoryId,
/// each variant's Id) instead of slugs, since admin edit/delete/stock-adjust actions all key off
/// them.</summary>
public sealed record AdminProductDto(
    Guid Id,
    string Slug,
    string Name,
    decimal Price,
    string Unit,
    Guid CategoryId,
    string CategoryName,
    string? ImageUrl,
    bool InStock,
    string Description,
    int Popularity,
    bool IsFeatured,
    IReadOnlyList<AdminProductVariantDto> Variants,
    IReadOnlyList<string> Images);
