using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Content;

public sealed class Testimonial : BaseAuditableEntity<Guid>
{
    public required string Initial { get; set; }

    /// <summary>CSS gradient for the avatar badge — no photo, matches the mockup's letter-avatar design.</summary>
    public required string AvatarGradient { get; set; }

    public required string Name { get; set; }

    public required string Text { get; set; }

    public int DisplayOrder { get; set; }
}
