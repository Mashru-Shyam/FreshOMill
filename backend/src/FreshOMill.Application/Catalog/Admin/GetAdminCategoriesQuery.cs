using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Catalog.Admin;

public sealed record GetAdminCategoriesQuery : IRequest<IReadOnlyList<AdminCategoryDto>>;

public sealed class GetAdminCategoriesQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminCategoriesQuery, IReadOnlyList<AdminCategoryDto>>
{
    public async Task<IReadOnlyList<AdminCategoryDto>> Handle(GetAdminCategoriesQuery request, CancellationToken cancellationToken) =>
        await context.Categories
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new AdminCategoryDto(c.Id, c.Slug, c.Name, c.ImageUrl, c.DisplayOrder))
            .ToListAsync(cancellationToken);
}
