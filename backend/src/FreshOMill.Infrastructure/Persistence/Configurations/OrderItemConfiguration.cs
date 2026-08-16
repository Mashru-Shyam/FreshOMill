using FreshOMill.Domain.Orders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.Property(i => i.ProductSlug).HasMaxLength(150);
        builder.Property(i => i.Name).HasMaxLength(200).IsRequired();
        builder.Property(i => i.ImageUrl).HasMaxLength(500);
        builder.Property(i => i.Variant).HasMaxLength(100).IsRequired();
        builder.Property(i => i.UnitPrice).HasPrecision(10, 2);

        builder.HasIndex(i => i.OrderId);
    }
}
