using FreshOMill.Domain.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class StoreSettingsConfiguration : IEntityTypeConfiguration<StoreSettings>
{
    private static readonly DateTimeOffset SeedCreatedAt = new(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

    public void Configure(EntityTypeBuilder<StoreSettings> builder)
    {
        builder.Property(s => s.Address).HasMaxLength(500).IsRequired();
        builder.Property(s => s.Phone).HasMaxLength(30).IsRequired();
        builder.Property(s => s.WhatsAppNumber).HasMaxLength(30).IsRequired();
        builder.Property(s => s.Email).HasMaxLength(200).IsRequired();
        builder.Property(s => s.OpeningHours).HasMaxLength(200).IsRequired();
        builder.Property(s => s.InstagramUrl).HasMaxLength(300);
        builder.Property(s => s.YoutubeUrl).HasMaxLength(300);
        builder.Property(s => s.LinkedInUrl).HasMaxLength(300);
        builder.Property(s => s.GoogleMapsUrl).HasMaxLength(300);

        // Seeded from the values that were hardcoded in the frontend before this table existed
        // (contact.html, footer.html, whatsapp-button.html) — the admin Settings screen is where
        // these get changed from now on, not a code edit.
        builder.HasData(new
        {
            Id = Guid.Parse("50a80001-0000-0000-0000-000000000001"),
            Created = SeedCreatedAt,
            Address = "Freshomill, GF - 3/4, Nexus Complex, Near Spring Retreat 4, White House Lane, Bhayli TP 1, Vasna Bhayli Road, Vadodara",
            Phone = "+91 76000 62637",
            WhatsAppNumber = "+917600062637",
            Email = "mashrushyam37@gmail.com",
            OpeningHours = "Everyday: 9:30 AM - 8:00 PM",
            InstagramUrl = "https://instagram.com/freshomill",
            YoutubeUrl = "https://youtube.com/@freshomill",
            LinkedInUrl = "https://linkedin.com/company/freshomill",
            GoogleMapsUrl = "https://maps.app.goo.gl/b6igQ81rRruLUmxC6",
        });
    }
}
