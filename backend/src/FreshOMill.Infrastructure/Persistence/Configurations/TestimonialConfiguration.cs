using FreshOMill.Domain.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class TestimonialConfiguration : IEntityTypeConfiguration<Testimonial>
{
    public void Configure(EntityTypeBuilder<Testimonial> builder)
    {
        builder.Property(t => t.Initial).HasMaxLength(5).IsRequired();
        builder.Property(t => t.AvatarGradient).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Name).HasMaxLength(100).IsRequired();
        builder.Property(t => t.Text).HasMaxLength(1000).IsRequired();
        builder.Property(t => t.VideoUrl).HasMaxLength(500);
    }
}
