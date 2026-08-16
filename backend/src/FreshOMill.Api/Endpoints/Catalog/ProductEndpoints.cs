using FreshOMill.Application.Catalog;
using MediatR;

namespace FreshOMill.Api.Endpoints.Catalog;

public static class ProductEndpoints
{
    public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/products", async (ISender sender, CancellationToken cancellationToken) =>
        {
            var products = await sender.Send(new GetProductsQuery(), cancellationToken);
            return Results.Ok(products);
        })
        .WithName("GetProducts")
        .WithTags("Catalog")
        .Produces<IReadOnlyList<ProductDto>>();

        return app;
    }
}
