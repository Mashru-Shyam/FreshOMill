using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Catalog;

/// <summary>
/// Returns the full product catalog in one shot. Store's own category/price/stock/sort/search
/// filtering all stays client-side (as it was against the old hardcoded array) — this just
/// swaps where the initial list comes from.
/// </summary>
public sealed record GetProductsQuery : IRequest<IReadOnlyList<ProductDto>>;

public sealed class GetProductsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetProductsQuery, IReadOnlyList<ProductDto>>
{
    public async Task<IReadOnlyList<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken) =>
        await context.Products
            .OrderBy(p => p.Popularity)
            .Select(p => new ProductDto(
                p.Slug,
                p.Name,
                p.Price,
                p.Unit,
                p.Category!.Slug,
                p.ImageUrl,
                p.InStock,
                p.Description,
                p.Popularity,
                p.IsFeatured,
                p.Variants
                    .OrderBy(v => v.SortOrder)
                    .Select(v => new ProductVariantDto(v.Label, v.Price, v.StockQuantity))
                    .ToList(),
                p.Images
                    .OrderBy(i => i.SortOrder)
                    .Select(i => i.ImageUrl)
                    .ToList()))
            .ToListAsync(cancellationToken);
}
