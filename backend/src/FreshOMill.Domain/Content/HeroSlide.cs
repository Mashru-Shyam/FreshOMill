using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Content;

public sealed class HeroSlide : BaseAuditableEntity<Guid>
{
    // See Identity/User.cs for why this self-assigns Id — was unnecessary while every HeroSlide
    // row came from a migration seed, until the admin Hero Slides screen started creating rows
    // at runtime.
    public HeroSlide() => Id = Guid.NewGuid();

    public string? ImageUrl { get; set; }

    public required string Alt { get; set; }

    public required string Icon { get; set; }

    public required string Title { get; set; }

    public required string Subtitle { get; set; }

    /// <summary>CSS gradient used as the slide's fallback background if <see cref="ImageUrl"/> is missing or fails to load.</summary>
    public required string FallbackGradient { get; set; }

    public int DisplayOrder { get; set; }
}
