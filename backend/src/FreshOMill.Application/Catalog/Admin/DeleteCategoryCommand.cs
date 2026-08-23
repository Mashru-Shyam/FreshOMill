using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Catalog.Admin;

public sealed record DeleteCategoryCommand(Guid Id) : IRequest;

public sealed class DeleteCategoryCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteCategoryCommand>
{
    public async Task Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await context.Categories.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Category not found.");

        if (await context.Products.AnyAsync(p => p.CategoryId == request.Id, cancellationToken))
        {
            throw new ConflictException(
                $"\"{category.Name}\" still has products in it. Move or delete them first.");
        }

        context.Categories.Remove(category);
        await context.SaveChangesAsync(cancellationToken);
    }
}
