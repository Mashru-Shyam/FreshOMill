using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Content;

/// <summary>
/// Single-row table — one source of truth for the contact/social info that used to be hardcoded
/// independently in the navbar, footer, Contact page, and WhatsApp button (changing the phone
/// number meant editing four files). Always exactly one row, seeded by the initial migration;
/// GetStoreSettingsQuery/UpdateStoreSettingsCommand both just read/write that one row.
/// </summary>
public sealed class StoreSettings : BaseAuditableEntity<Guid>
{
    public StoreSettings() => Id = Guid.NewGuid();

    public required string Address { get; set; }

    public required string Phone { get; set; }

    public required string WhatsAppNumber { get; set; }

    public required string Email { get; set; }

    public required string OpeningHours { get; set; }

    public string? InstagramUrl { get; set; }

    public string? YoutubeUrl { get; set; }

    public string? LinkedInUrl { get; set; }

    public string? GoogleMapsUrl { get; set; }
}
