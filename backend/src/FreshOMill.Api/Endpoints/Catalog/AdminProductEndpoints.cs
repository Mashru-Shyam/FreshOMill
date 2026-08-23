using FreshOMill.Application.Catalog.Admin;
using MediatR;

namespace FreshOMill.Api.Endpoints.Catalog;

public static class AdminProductEndpoints
{
    public static IEndpointRouteBuilder MapAdminProductEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin/products").WithTags("Admin").RequireAuthorization("Admin");

        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new GetAdminProductsQuery(), cancellationToken)))
            .WithName("GetAdminProducts")
            .Produces<IReadOnlyList<AdminProductDto>>();

        group.MapPost("/", async (CreateProductCommand command, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(command, cancellationToken)))
            .WithName("CreateProduct")
            .Produces<AdminProductDto>();

        group.MapPut("/{id:guid}", async (Guid id, UpdateProductRequest request, ISender sender, CancellationToken cancellationToken) =>
        {
            var command = new UpdateProductCommand(
                id, request.Name, request.Price, request.Unit, request.CategoryId,
                request.Description, request.Popularity, request.IsFeatured, request.Variants, request.ImageUrls);
            return Results.Ok(await sender.Send(command, cancellationToken));
        })
        .WithName("UpdateProduct")
        .Produces<AdminProductDto>();

        group.MapDelete("/{id:guid}", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
        {
            await sender.Send(new DeleteProductCommand(id), cancellationToken);
            return Results.NoContent();
        })
        .WithName("DeleteProduct");

        group.MapPost("/variants/{variantId:guid}/stock", async (Guid variantId, AdjustStockRequest request, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new AdjustStockCommand(variantId, request.NewQuantity, request.Reason), cancellationToken)))
            .WithName("AdjustStock")
            .Produces<AdminProductDto>();

        return app;
    }
}

public sealed record UpdateProductRequest(
    string Name,
    decimal Price,
    string Unit,
    Guid CategoryId,
    string Description,
    int Popularity,
    bool IsFeatured,
    IReadOnlyList<ProductVariantInput> Variants,
    IReadOnlyList<string> ImageUrls);

public sealed record AdjustStockRequest(int NewQuantity, string Reason);
