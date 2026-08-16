using FreshOMill.Domain.Content;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class TestimonialConfiguration : IEntityTypeConfiguration<Testimonial>
{
    // Same fixed-timestamp rationale as CategoryConfiguration.SeedCreatedAt.
    private static readonly DateTimeOffset SeedCreatedAt = new(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

    public void Configure(EntityTypeBuilder<Testimonial> builder)
    {
        builder.Property(t => t.Initial).HasMaxLength(5).IsRequired();
        builder.Property(t => t.AvatarGradient).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Name).HasMaxLength(100).IsRequired();
        builder.Property(t => t.Text).HasMaxLength(1000).IsRequired();

        // Anonymous objects, not `new Testimonial { ... }` — same reason as CategoryConfiguration
        // (Id has a protected setter). Fixed GUIDs so this seed is reproducible.
        builder.HasData(
            new
            {
                Id = Guid.Parse("f0a80001-0000-0000-0000-000000000001"),
                Created = SeedCreatedAt,
                Initial = "A",
                AvatarGradient = "linear-gradient(135deg, var(--color-brand-brown), var(--color-secondary))",
                Name = "Ananya R.",
                Text = "The chakki-fresh atta tastes completely different from what we used to buy — you can actually smell the wheat. Packaging is clean and delivery was quicker than I expected. Genuinely happy with the switch....",
                DisplayOrder = 1,
            },
            new
            {
                Id = Guid.Parse("f0a80001-0000-0000-0000-000000000002"),
                Created = SeedCreatedAt,
                Initial = "R",
                AvatarGradient = "linear-gradient(135deg, var(--color-secondary), var(--color-primary))",
                Name = "Rahul K.",
                Text = "Ordered the cold-pressed groundnut oil and a few spice powders — everything felt genuinely fresh, not sitting-on-a-shelf-for-months fresh. No unnecessary plastic either, which I appreciated a lot....",
                DisplayOrder = 2,
            },
            new
            {
                Id = Guid.Parse("f0a80001-0000-0000-0000-000000000003"),
                Created = SeedCreatedAt,
                Initial = "M",
                AvatarGradient = "linear-gradient(135deg, var(--color-brand-green), var(--color-primary))",
                Name = "Meera S.",
                Text = "I've been buying millets and dry fruits for a few months now and the quality has been consistent every single time. Support on WhatsApp was also quick to sort out a delivery delay....",
                DisplayOrder = 3,
            }
        );
    }
}
