using FreshOMill.Domain.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class StoreSettingsConfiguration : IEntityTypeConfiguration<StoreSettings>
{
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
        builder.Property(s => s.AllProductsImageUrl).HasMaxLength(500);
    }
}
