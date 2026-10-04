namespace FreshOMill.Application.Content;

public sealed record TestimonialDto(
    string Initial,
    string AvatarGradient,
    string Name,
    string Text,
    string? VideoUrl,
    int DisplayOrder);
