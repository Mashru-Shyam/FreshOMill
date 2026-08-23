using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Application.Common.Text;
using FreshOMill.Domain.Catalog;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Catalog.Admin;

/// <summary><paramref name="ImageUrls"/> is the full ordered gallery — the first entry also
/// becomes the product's single "primary" image (<see cref="Product.ImageUrl"/>) that every
/// existing card/grid/search view already renders.</summary>
public sealed record CreateProductCommand(
    string Name,
    decimal Price,
    string Unit,
    Guid CategoryId,
    string Description,
    int Popularity,
    bool IsFeatured,
    IReadOnlyList<ProductVariantInput> Variants,
    IReadOnlyList<string> ImageUrls) : IRequest<AdminProductDto>;

public sealed class CreateProductCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateProductCommand, AdminProductDto>
{
    public async Task<AdminProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var category = await context.Categories.FirstOrDefaultAsync(c => c.Id == request.CategoryId, cancellationToken)
            ?? throw new NotFoundException("Category not found.");

        var slug = SlugGenerator.FromName(request.Name);
        if (await context.Products.AnyAsync(p => p.Slug == slug, cancellationToken))
        {
            throw new ConflictException($"A product named \"{request.Name}\" already exists.");
        }

        var product = new Product
        {
            Slug = slug,
            Name = request.Name,
            Price = request.Price,
            Unit = request.Unit,
            CategoryId = category.Id,
            ImageUrl = request.ImageUrls.Count > 0 ? request.ImageUrls[0] : null,
            Description = request.Description,
            Popularity = request.Popularity,
            IsFeatured = request.IsFeatured,
            InStock = request.Variants.Any(v => v.StockQuantity > 0),
            Variants = request.Variants
                .Select(v => new ProductVariant
                {
                    Label = v.Label,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    SortOrder = v.SortOrder,
                })
                .ToList(),
            Images = request.ImageUrls
                .Select((url, index) => new ProductImage { ImageUrl = url, SortOrder = index })
                .ToList(),
        };

        context.Products.Add(product);
        await context.SaveChangesAsync(cancellationToken);

        return ToDto(product, category.Name);
    }

    internal static AdminProductDto ToDto(Product product, string categoryName) => new(
        product.Id,
        product.Slug,
        product.Name,
        product.Price,
        product.Unit,
        product.CategoryId,
        categoryName,
        product.ImageUrl,
        product.InStock,
        product.Description,
        product.Popularity,
        product.IsFeatured,
        product.Variants
            .OrderBy(v => v.SortOrder)
            .Select(v => new AdminProductVariantDto(v.Id, v.Label, v.Price, v.StockQuantity, v.SortOrder))
            .ToList(),
        product.Images
            .OrderBy(i => i.SortOrder)
            .Select(i => i.ImageUrl)
            .ToList());
}
