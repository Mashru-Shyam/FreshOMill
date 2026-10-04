using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Content;

public sealed class Testimonial : BaseAuditableEntity<Guid>
{
    public Testimonial() => Id = Guid.NewGuid();

    public required string Initial { get; set; }

    /// <summary>CSS gradient for the avatar badge — no photo, matches the mockup's letter-avatar design.</summary>
    public required string AvatarGradient { get; set; }

    public required string Name { get; set; }

    public required string Text { get; set; }

    /// <summary>Optional video testimonial uploaded from the admin panel — shown in place of the
    /// letter-avatar card on the storefront when present.</summary>
    public string? VideoUrl { get; set; }

    public int DisplayOrder { get; set; }
}
