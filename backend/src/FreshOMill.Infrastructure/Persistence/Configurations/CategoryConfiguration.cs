using FreshOMill.Domain.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    // Fixed timestamp (not DateTimeOffset.UtcNow) — Created is a required audit column, and a
    // moving "now" value would make every migration regeneration produce a spurious diff.
    private static readonly DateTimeOffset SeedCreatedAt = new(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.Property(c => c.Slug).HasMaxLength(100).IsRequired();
        builder.HasIndex(c => c.Slug).IsUnique();

        builder.Property(c => c.Name).HasMaxLength(200).IsRequired();
        builder.Property(c => c.ImageUrl).HasMaxLength(500);

        // Anonymous objects, not `new Category { ... }` — Category.Id has a protected setter (from
        // BaseEntity), which HasData's reflection-based materialization can populate but a C#
        // object initializer outside the class can't. Fixed GUIDs (not Guid.NewGuid()) so this seed
        // produces the same rows on every `dotnet ef migrations add`/`database update` run.
        builder.HasData(
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000001"), Created = SeedCreatedAt, Slug = "wood-pressed-oils", Name = "Wood Pressed Oils", ImageUrl = "/images/categories/wood-pressed-oils.jpg", DisplayOrder = 1 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000002"), Created = SeedCreatedAt, Slug = "flour-multigrain", Name = "Flour & Multigrain", ImageUrl = "/images/categories/flour-multigrain.jpg", DisplayOrder = 2 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000003"), Created = SeedCreatedAt, Slug = "dry-fruits-dates", Name = "Dry Fruits & Dates", ImageUrl = "/images/categories/dry-fruits-dates.jpg", DisplayOrder = 3 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000004"), Created = SeedCreatedAt, Slug = "nuts-seeds", Name = "Nuts & Seeds", ImageUrl = "/images/categories/nuts-seeds.jpg", DisplayOrder = 4 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000005"), Created = SeedCreatedAt, Slug = "millets", Name = "Millets", ImageUrl = "/images/categories/millets.jpg", DisplayOrder = 5 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000006"), Created = SeedCreatedAt, Slug = "spices", Name = "Spices", ImageUrl = "/images/categories/spices.jpg", DisplayOrder = 6 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000007"), Created = SeedCreatedAt, Slug = "masalas", Name = "Masalas", ImageUrl = "/images/categories/masalas.jpg", DisplayOrder = 7 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000008"), Created = SeedCreatedAt, Slug = "health-foods", Name = "Health Foods", ImageUrl = "/images/categories/health-foods.jpg", DisplayOrder = 8 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000009"), Created = SeedCreatedAt, Slug = "coffee-tea", Name = "Coffee & Tea", ImageUrl = "/images/categories/coffee-tea.jpg", DisplayOrder = 9 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000010"), Created = SeedCreatedAt, Slug = "pickles", Name = "Pickles", ImageUrl = "/images/categories/pickles.jpg", DisplayOrder = 10 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000011"), Created = SeedCreatedAt, Slug = "rice-grains", Name = "Rice & Grains", ImageUrl = "/images/categories/rice-grains.jpg", DisplayOrder = 11 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000012"), Created = SeedCreatedAt, Slug = "ghee-dairy", Name = "Ghee & Dairy", ImageUrl = "/images/categories/ghee-dairy.jpg", DisplayOrder = 12 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000013"), Created = SeedCreatedAt, Slug = "honey-jaggery", Name = "Honey & Jaggery", ImageUrl = "/images/categories/honey-jaggery.jpg", DisplayOrder = 13 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000014"), Created = SeedCreatedAt, Slug = "herbal-wellness", Name = "Herbal & Wellness", ImageUrl = "/images/categories/herbal-wellness.jpg", DisplayOrder = 14 },
            new { Id = Guid.Parse("c0a80001-0000-0000-0000-000000000015"), Created = SeedCreatedAt, Slug = "snacks-namkeen", Name = "Snacks & Namkeen", ImageUrl = "/images/categories/snacks-namkeen.jpg", DisplayOrder = 15 }
        );
    }
}
