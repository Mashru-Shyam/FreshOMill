namespace FreshOMill.Application.Catalog.Admin;

/// <summary>Same shape as CategoryDto plus the real Id — the public DTO only exposes Slug since
/// that's all the storefront ever needs, but admin edit/delete actions key off Id.</summary>
public sealed record AdminCategoryDto(Guid Id, string Slug, string Name, string? ImageUrl, int DisplayOrder);
