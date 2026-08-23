using System.Reflection;
using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Domain.Addresses;
using FreshOMill.Domain.Catalog;
using FreshOMill.Domain.Contact;
using FreshOMill.Domain.Content;
using FreshOMill.Domain.Identity;
using FreshOMill.Domain.Orders;
using Microsoft.EntityFrameworkCore;
using CartAggregate = FreshOMill.Domain.Cart.Cart;
using CartLine = FreshOMill.Domain.Cart.CartLine;

namespace FreshOMill.Infrastructure.Persistence;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<HeroSlide> HeroSlides => Set<HeroSlide>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<StoreSettings> StoreSettings => Set<StoreSettings>();
    public DbSet<User> Users => Set<User>();
    public DbSet<OtpChallenge> OtpChallenges => Set<OtpChallenge>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<CartAggregate> Carts => Set<CartAggregate>();
    public DbSet<CartLine> CartLines => Set<CartLine>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
    }
}
