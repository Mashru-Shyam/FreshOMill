using FreshOMill.Domain.Cart;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class CartLineConfiguration : IEntityTypeConfiguration<CartLine>
{
    public void Configure(EntityTypeBuilder<CartLine> builder)
    {
        builder.Property(l => l.ProductSlug).HasMaxLength(150);
        builder.Property(l => l.Name).HasMaxLength(200).IsRequired();
        builder.Property(l => l.ImageUrl).HasMaxLength(500);
        builder.Property(l => l.Variant).HasMaxLength(100).IsRequired();
        builder.Property(l => l.UnitPrice).HasPrecision(10, 2);

        builder.HasIndex(l => l.CartId);
    }
}
