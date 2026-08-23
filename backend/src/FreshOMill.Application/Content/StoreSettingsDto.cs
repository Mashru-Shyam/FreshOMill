namespace FreshOMill.Application.Content;

public sealed record StoreSettingsDto(
    string Address,
    string Phone,
    string WhatsAppNumber,
    string Email,
    string OpeningHours,
    string? InstagramUrl,
    string? YoutubeUrl,
    string? LinkedInUrl,
    string? GoogleMapsUrl);
