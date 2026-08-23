namespace FreshOMill.Application.Content.Admin;

/// <summary>Same shape as HeroSlideDto plus the real Id — the public DTO never needed one since
/// the storefront only ever reads the list, but admin edit/delete/reorder actions key off it.</summary>
public sealed record AdminHeroSlideDto(
    Guid Id,
    string? ImageUrl,
    string Alt,
    string Icon,
    string Title,
    string Subtitle,
    string FallbackGradient,
    int DisplayOrder);
