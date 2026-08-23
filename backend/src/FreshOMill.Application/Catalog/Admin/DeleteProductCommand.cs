using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Catalog.Admin;

public sealed record DeleteProductCommand(Guid Id) : IRequest;

public sealed class DeleteProductCommandHandler(IApplicationDbContext context)
    : IRequestHandler<DeleteProductCommand>
{
    public async Task Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await context.Products.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Product not found.");

        context.Products.Remove(product);
        await context.SaveChangesAsync(cancellationToken);
    }
}
