using FreshOMill.Domain.Identity;
using FreshOMill.Domain.Orders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.Property(o => o.Total).HasPrecision(10, 2);
        builder.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(o => o.PaymentMethod).HasConversion<string>().HasMaxLength(10);
        builder.Property(o => o.GatewayOrderId).HasMaxLength(100);
        builder.Property(o => o.GatewayPaymentId).HasMaxLength(100);

        builder.Property(o => o.ShippingFullName).HasMaxLength(200).IsRequired();
        builder.Property(o => o.ShippingPhone).HasMaxLength(20).IsRequired();
        builder.Property(o => o.ShippingAddressLine1).HasMaxLength(300).IsRequired();
        builder.Property(o => o.ShippingAddressLine2).HasMaxLength(300);
        builder.Property(o => o.ShippingCity).HasMaxLength(100).IsRequired();
        builder.Property(o => o.ShippingState).HasMaxLength(100).IsRequired();
        builder.Property(o => o.ShippingPincode).HasMaxLength(10).IsRequired();

        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => o.GatewayOrderId); // looked up by the Razorpay webhook, which only knows the gateway order id

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict); // never lose order history if a user row is ever removed

        builder.HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
