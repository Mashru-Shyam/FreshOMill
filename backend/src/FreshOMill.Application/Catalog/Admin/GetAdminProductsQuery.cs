using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Catalog.Admin;

public sealed record GetAdminProductsQuery : IRequest<IReadOnlyList<AdminProductDto>>;

public sealed class GetAdminProductsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminProductsQuery, IReadOnlyList<AdminProductDto>>
{
    public async Task<IReadOnlyList<AdminProductDto>> Handle(GetAdminProductsQuery request, CancellationToken cancellationToken) =>
        await context.Products
            .OrderBy(p => p.Name)
            .Select(p => new AdminProductDto(
                p.Id,
                p.Slug,
                p.Name,
                p.Price,
                p.Unit,
                p.CategoryId,
                p.Category!.Name,
                p.ImageUrl,
                p.InStock,
                p.Description,
                p.Popularity,
                p.IsFeatured,
                p.Variants
                    .OrderBy(v => v.SortOrder)
                    .Select(v => new AdminProductVariantDto(v.Id, v.Label, v.Price, v.StockQuantity, v.SortOrder))
                    .ToList(),
                p.Images
                    .OrderBy(i => i.SortOrder)
                    .Select(i => i.ImageUrl)
                    .ToList()))
            .ToListAsync(cancellationToken);
}
