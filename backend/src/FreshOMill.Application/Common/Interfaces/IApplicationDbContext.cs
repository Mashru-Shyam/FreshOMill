using FreshOMill.Domain.Addresses;
using FreshOMill.Domain.Cart;
using FreshOMill.Domain.Catalog;
using FreshOMill.Domain.Contact;
using FreshOMill.Domain.Content;
using FreshOMill.Domain.Identity;
using FreshOMill.Domain.Orders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace FreshOMill.Application.Common.Interfaces;

/// <summary>
/// Abstraction over the EF Core DbContext so Application code never depends on Infrastructure.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<Category> Categories { get; }

    DbSet<Product> Products { get; }

    DbSet<ProductVariant> ProductVariants { get; }

    DbSet<ProductImage> ProductImages { get; }

    DbSet<HeroSlide> HeroSlides { get; }

    DbSet<Testimonial> Testimonials { get; }

    DbSet<StoreSettings> StoreSettings { get; }

    DbSet<User> Users { get; }

    DbSet<OtpChallenge> OtpChallenges { get; }

    DbSet<RefreshToken> RefreshTokens { get; }

    DbSet<Address> Addresses { get; }

    DbSet<FreshOMill.Domain.Cart.Cart> Carts { get; }

    DbSet<CartLine> CartLines { get; }

    DbSet<Order> Orders { get; }

    DbSet<OrderItem> OrderItems { get; }

    DbSet<ContactMessage> ContactMessages { get; }

    ChangeTracker ChangeTracker { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
