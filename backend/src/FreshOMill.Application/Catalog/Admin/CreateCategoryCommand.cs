using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Application.Common.Text;
using FreshOMill.Domain.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Catalog.Admin;

public sealed record CreateCategoryCommand(string Name, string? ImageUrl, int DisplayOrder) : IRequest<CategoryDto>;

public sealed class CreateCategoryCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var slug = SlugGenerator.FromName(request.Name);
        if (await context.Categories.AnyAsync(c => c.Slug == slug, cancellationToken))
        {
            throw new ConflictException($"A category named \"{request.Name}\" already exists.");
        }

        var category = new Category
        {
            Slug = slug,
            Name = request.Name,
            ImageUrl = request.ImageUrl,
            DisplayOrder = request.DisplayOrder,
        };
        context.Categories.Add(category);
        await context.SaveChangesAsync(cancellationToken);

        return new CategoryDto(category.Slug, category.Name, category.ImageUrl, category.DisplayOrder);
    }
}
