namespace FreshOMill.Application.Content.Admin;

public sealed record AdminTestimonialDto(
    Guid Id,
    string Initial,
    string AvatarGradient,
    string Name,
    string Text,
    string? VideoUrl,
    int DisplayOrder);
