using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FreshOMill.Application.Catalog.Admin;

/// <summary>Sets a variant's stock to an exact new value (not a delta) with a reason — logged via
/// ILogger rather than a persisted audit table for now; a proper AdminAuditLog table is Phase 2 of
/// the Admin Panel plan, not MVP. Recalculates the parent Product's InStock flag afterward.</summary>
public sealed record AdjustStockCommand(Guid VariantId, int NewQuantity, string Reason) : IRequest<AdminProductDto>;

public sealed class AdjustStockCommandHandler(IApplicationDbContext context, ILogger<AdjustStockCommandHandler> logger)
    : IRequestHandler<AdjustStockCommand, AdminProductDto>
{
    public async Task<AdminProductDto> Handle(AdjustStockCommand request, CancellationToken cancellationToken)
    {
        var variant = await context.ProductVariants
            .Include(v => v.Product!)
            .ThenInclude(p => p.Variants)
            .Include(v => v.Product!)
            .ThenInclude(p => p.Category)
            .FirstOrDefaultAsync(v => v.Id == request.VariantId, cancellationToken)
            ?? throw new NotFoundException("Product variant not found.");

        var product = variant.Product!;
        var previous = variant.StockQuantity;
        variant.StockQuantity = request.NewQuantity;
        product.RecalculateInStock();

        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Stock adjusted for {ProductName} ({VariantLabel}): {Previous} -> {New}. Reason: {Reason}",
            product.Name, variant.Label, previous, request.NewQuantity, request.Reason);

        return CreateProductCommandHandler.ToDto(product, product.Category!.Name);
    }
}
