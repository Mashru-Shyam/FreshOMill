using FreshOMill.Application.Common.Interfaces;
using CartAggregate = FreshOMill.Domain.Cart.Cart;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Cart;

internal static class CartHelpers
{
    public static async Task<CartAggregate> GetOrCreateCartAsync(IApplicationDbContext context, Guid userId, CancellationToken cancellationToken)
    {
        var cart = await context.Carts
            .Include(c => c.Lines)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

        if (cart is not null)
        {
            return cart;
        }

        cart = new CartAggregate { UserId = userId };
        context.Carts.Add(cart);
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // Carts.UserId is unique — a concurrent request for the same user (e.g. two rapid
            // add-to-cart clicks before either has a cart yet) can lose this exact race. Rather
            // than surface an error for what's really a harmless double-create, drop our failed
            // insert and load the cart the other request just won.
            context.ChangeTracker.Clear();
            cart = await context.Carts
                .Include(c => c.Lines)
                .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
            if (cart is null)
            {
                throw;
            }
        }
        return cart;
    }

    public static CartDto ToDto(CartAggregate cart) =>
        new(
            cart.Lines
                .OrderBy(l => l.Created)
                .Select(l => new CartLineDto(l.Id, l.ProductSlug, l.Name, l.ImageUrl, l.Variant, l.UnitPrice, l.Qty))
                .ToList(),
            cart.Lines.Sum(l => l.UnitPrice * l.Qty));

    /// <summary>Retries a cart mutation once (with a fresh read) if it collides with a concurrent
    /// mutation of the same cart — e.g. two near-simultaneous requests updating/removing the same
    /// line. Both requests always resolve to the same idempotent user intent (add N, set qty to N,
    /// remove line X), so silently retrying against the now-current state is the correct recovery,
    /// not a bug in itself — the fallback error only surfaces if the collision keeps recurring.</summary>
    public static async Task<T> WithRetryAsync<T>(IApplicationDbContext context, Func<Task<T>> operation)
    {
        const int maxAttempts = 3;
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                return await operation();
            }
            catch (DbUpdateException) when (attempt < maxAttempts)
            {
                context.ChangeTracker.Clear();
            }
        }
    }
}
