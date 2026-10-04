using FreshOMill.Domain.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.Property(p => p.Slug).HasMaxLength(150).IsRequired();
        builder.HasIndex(p => p.Slug).IsUnique();

        builder.Property(p => p.Name).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Price).HasPrecision(10, 2);
        builder.Property(p => p.Unit).HasMaxLength(50).IsRequired();
        builder.Property(p => p.ImageUrl).HasMaxLength(500);
        builder.Property(p => p.Description).HasMaxLength(1000).IsRequired();

        builder.HasOne(p => p.Category)
            .WithMany()
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
