using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Catalog.Admin;

/// <summary>Name changes never reslug an existing category — the slug is already linked from
/// live product rows and (potentially) bookmarked Store URLs, so it stays stable once created.</summary>
public sealed record UpdateCategoryCommand(Guid Id, string Name, string? ImageUrl, int DisplayOrder) : IRequest<CategoryDto>;

public sealed class UpdateCategoryCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateCategoryCommand, CategoryDto>
{
    public async Task<CategoryDto> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await context.Categories.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Category not found.");

        category.Name = request.Name;
        category.ImageUrl = request.ImageUrl;
        category.DisplayOrder = request.DisplayOrder;

        await context.SaveChangesAsync(cancellationToken);

        return new CategoryDto(category.Slug, category.Name, category.ImageUrl, category.DisplayOrder);
    }
}
