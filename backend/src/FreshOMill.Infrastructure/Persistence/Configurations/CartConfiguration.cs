using CartAggregate = FreshOMill.Domain.Cart.Cart;
using FreshOMill.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshOMill.Infrastructure.Persistence.Configurations;

public sealed class CartConfiguration : IEntityTypeConfiguration<CartAggregate>
{
    public void Configure(EntityTypeBuilder<CartAggregate> builder)
    {
        builder.HasIndex(c => c.UserId).IsUnique();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Lines)
            .WithOne()
            .HasForeignKey(l => l.CartId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
