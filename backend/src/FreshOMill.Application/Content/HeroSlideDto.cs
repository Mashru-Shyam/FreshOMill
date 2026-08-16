namespace FreshOMill.Application.Content;

public sealed record HeroSlideDto(
    string? ImageUrl,
    string Alt,
    string Icon,
    string Title,
    string Subtitle,
    string FallbackGradient,
    int DisplayOrder);
