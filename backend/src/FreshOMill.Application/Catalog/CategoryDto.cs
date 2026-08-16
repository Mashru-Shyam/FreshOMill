namespace FreshOMill.Application.Catalog;

public sealed record CategoryDto(string Slug, string Name, string? ImageUrl, int DisplayOrder);
