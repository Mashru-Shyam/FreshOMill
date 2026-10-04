using FreshOMill.Domain.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class HeroSlideConfiguration : IEntityTypeConfiguration<HeroSlide>
{
    public void Configure(EntityTypeBuilder<HeroSlide> builder)
    {
        builder.Property(s => s.ImageUrl).HasMaxLength(500);
        builder.Property(s => s.Alt).HasMaxLength(300).IsRequired();
        builder.Property(s => s.Icon).HasMaxLength(50).IsRequired();
        builder.Property(s => s.Title).HasMaxLength(200).IsRequired();
        builder.Property(s => s.Subtitle).HasMaxLength(300).IsRequired();
        builder.Property(s => s.FallbackGradient).HasMaxLength(200).IsRequired();
    }
}
