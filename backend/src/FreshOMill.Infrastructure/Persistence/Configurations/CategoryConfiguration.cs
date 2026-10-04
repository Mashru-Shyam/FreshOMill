using FreshOMill.Domain.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.Property(c => c.Slug).HasMaxLength(100).IsRequired();
        builder.HasIndex(c => c.Slug).IsUnique();

        builder.Property(c => c.Name).HasMaxLength(200).IsRequired();
        builder.Property(c => c.ImageUrl).HasMaxLength(500);
    }
}
