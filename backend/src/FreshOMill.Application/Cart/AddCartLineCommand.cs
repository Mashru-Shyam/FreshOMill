using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Domain.Cart;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace FreshOMill.Application.Cart;

public sealed record AddCartLineCommand(
    string? ProductSlug,
    string Name,
    string? ImageUrl,
    string Variant,
    decimal UnitPrice,
    int Qty) : IRequest<CartDto>;

/// <summary>Matches an existing line by (ProductSlug, Variant) and bumps its qty instead of adding
/// a duplicate row — same dedup key as CartService.add()'s `${productId}::${variant}` on the frontend.</summary>
public sealed class AddCartLineCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<AddCartLineCommand, CartDto>
{
    public Task<CartDto> Handle(AddCartLineCommand request, CancellationToken cancellationToken) =>
        CartHelpers.WithRetryAsync(context, () => ExecuteAsync(request, cancellationToken));

    private async Task<CartDto> ExecuteAsync(AddCartLineCommand request, CancellationToken cancellationToken)
    {
        var cart = await CartHelpers.GetOrCreateCartAsync(context, currentUser.UserId!.Value, cancellationToken);

        // The client suggests a price (it needs one to render before this round-trip completes),
        // but the ProductVariant catalog is authoritative whenever the line resolves to one —
        // never trust a client-supplied price for a known product/variant pair.
        var unitPrice = request.UnitPrice;
        if (request.ProductSlug is not null)
        {
            var product = await context.Products
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Slug == request.ProductSlug, cancellationToken);
            var variant = product?.Variants.FirstOrDefault(v => v.Label == request.Variant);
            if (variant is not null)
            {
                unitPrice = variant.Price;
            }
        }

        var existing = cart.Lines.FirstOrDefault(l => l.ProductSlug == request.ProductSlug && l.Variant == request.Variant);
        if (existing is not null)
        {
            existing.Qty += request.Qty;
        }
        else
        {
            var newLine = new CartLine
            {
                CartId = cart.Id,
                ProductSlug = request.ProductSlug,
                Name = request.Name,
                ImageUrl = request.ImageUrl,
                Variant = request.Variant,
                UnitPrice = unitPrice,
                Qty = request.Qty,
            };
            cart.Lines.Add(newLine);
            // CartLine self-assigns a non-default Id in its constructor (see CartLine.cs), so
            // adding it only via the navigation collection leaves EF's change tracker unable to
            // tell "brand new row" from "already exists" — it was inferring Modified (UPDATE)
            // instead of Added (INSERT), which then always failed with a concurrency exception
            // since no row with that Id exists yet. Explicitly adding to the DbSet forces the
            // correct Added state.
            context.CartLines.Add(newLine);
        }

        await context.SaveChangesAsync(cancellationToken);
        return CartHelpers.ToDto(cart);
    }
}
