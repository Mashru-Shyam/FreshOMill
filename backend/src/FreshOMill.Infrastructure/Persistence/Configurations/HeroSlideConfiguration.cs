using FreshOMill.Domain.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class HeroSlideConfiguration : IEntityTypeConfiguration<HeroSlide>
{
    // Same fixed-timestamp rationale as CategoryConfiguration.SeedCreatedAt.
    private static readonly DateTimeOffset SeedCreatedAt = new(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

    public void Configure(EntityTypeBuilder<HeroSlide> builder)
    {
        builder.Property(s => s.ImageUrl).HasMaxLength(500);
        builder.Property(s => s.Alt).HasMaxLength(300).IsRequired();
        builder.Property(s => s.Icon).HasMaxLength(50).IsRequired();
        builder.Property(s => s.Title).HasMaxLength(200).IsRequired();
        builder.Property(s => s.Subtitle).HasMaxLength(300).IsRequired();
        builder.Property(s => s.FallbackGradient).HasMaxLength(200).IsRequired();

        // Anonymous objects, not `new HeroSlide { ... }` — same reason as CategoryConfiguration
        // (Id has a protected setter). Fixed GUIDs so this seed is reproducible.
        builder.HasData(
            new
            {
                Id = Guid.Parse("e0a80001-0000-0000-0000-000000000001"),
                Created = SeedCreatedAt,
                ImageUrl = "/images/hero/hero-stone-ground-atta.jpg",
                Alt = "Stone-ground wheat flour and whole wheat grains beside a traditional millstone",
                Icon = "wheat",
                Title = "100% Stone-Ground Chakki Fresh Atta",
                Subtitle = "Milled strictly after your order is placed",
                FallbackGradient = "linear-gradient(135deg, #1f736f 0%, #4553c4 100%)",
                DisplayOrder = 1,
            },
            new
            {
                Id = Guid.Parse("e0a80001-0000-0000-0000-000000000002"),
                Created = SeedCreatedAt,
                ImageUrl = "/images/hero/hero-multigrain-essentials.jpg",
                Alt = "Bowls of organic multi-grain flours — millet, corn, sorghum and ragi",
                Icon = "sprout",
                Title = "Pure & Organic Multi-Grain Essentials",
                Subtitle = "Sourced directly from local certified organic farms",
                FallbackGradient = "linear-gradient(135deg, #1f7a50 0%, #1f736f 100%)",
                DisplayOrder = 2,
            },
            new
            {
                Id = Guid.Parse("e0a80001-0000-0000-0000-000000000003"),
                Created = SeedCreatedAt,
                ImageUrl = "/images/hero/hero-packed-on-order.jpg",
                Alt = "Freshly packed flour sacks tied and labeled, ready for delivery",
                Icon = "package-check",
                Title = "Washed, Cleaned & Packed on Order",
                Subtitle = "Zero preservatives, zero adulterants — guaranteed",
                FallbackGradient = "linear-gradient(135deg, #9c3d18 0%, #c07a2c 100%)",
                DisplayOrder = 3,
            }
        );
    }
}
