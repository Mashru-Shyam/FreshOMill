using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Catalog;

public sealed record GetCategoriesQuery : IRequest<IReadOnlyList<CategoryDto>>;

public sealed class GetCategoriesQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetCategoriesQuery, IReadOnlyList<CategoryDto>>
{
    public async Task<IReadOnlyList<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken) =>
        await context.Categories
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto(c.Slug, c.Name, c.ImageUrl, c.DisplayOrder))
            .ToListAsync(cancellationToken);
}
