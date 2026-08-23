using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Domain.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Catalog.Admin;

/// <summary>Slug is never changed on update, same reasoning as UpdateCategoryCommand. Variants
/// are replaced wholesale each call: rows in <paramref name="Variants"/> with an Id update that
/// row, rows with a null Id are added, and any existing variant row not present in the request
/// is removed — the admin form always submits its full current variant list, never a delta.</summary>
public sealed record UpdateProductCommand(
    Guid Id,
    string Name,
    decimal Price,
    string Unit,
    Guid CategoryId,
    string Description,
    int Popularity,
    bool IsFeatured,
    IReadOnlyList<ProductVariantInput> Variants,
    IReadOnlyList<string> ImageUrls) : IRequest<AdminProductDto>;

public sealed class UpdateProductCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateProductCommand, AdminProductDto>
{
    public async Task<AdminProductDto> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await context.Products
            .Include(p => p.Variants)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Product not found.");

        var category = await context.Categories.FirstOrDefaultAsync(c => c.Id == request.CategoryId, cancellationToken)
            ?? throw new NotFoundException("Category not found.");

        product.Name = request.Name;
        product.Price = request.Price;
        product.Unit = request.Unit;
        product.CategoryId = category.Id;
        product.ImageUrl = request.ImageUrls.Count > 0 ? request.ImageUrls[0] : null;
        product.Description = request.Description;
        product.Popularity = request.Popularity;
        product.IsFeatured = request.IsFeatured;

        // Images have no admin-facing state tied to their row (unlike variants, whose Id is what
        // AdjustStockCommand targets) — a full replace each save is simpler than diffing and just
        // as correct, since the admin form always submits its complete current gallery.
        product.Images.Clear();
        product.Images.AddRange(
            request.ImageUrls.Select((url, index) => new ProductImage { ImageUrl = url, SortOrder = index }));

        var incomingIds = request.Variants.Where(v => v.Id.HasValue).Select(v => v.Id!.Value).ToHashSet();
        product.Variants.RemoveAll(existing => !incomingIds.Contains(existing.Id));

        foreach (var input in request.Variants)
        {
            var variant = input.Id.HasValue
                ? product.Variants.FirstOrDefault(v => v.Id == input.Id.Value)
                : null;

            if (variant is null)
            {
                product.Variants.Add(new ProductVariant
                {
                    Label = input.Label,
                    Price = input.Price,
                    StockQuantity = input.StockQuantity,
                    SortOrder = input.SortOrder,
                });
            }
            else
            {
                variant.Label = input.Label;
                variant.Price = input.Price;
                variant.StockQuantity = input.StockQuantity;
                variant.SortOrder = input.SortOrder;
            }
        }

        product.RecalculateInStock();

        await context.SaveChangesAsync(cancellationToken);

        return CreateProductCommandHandler.ToDto(product, category.Name);
    }
}
