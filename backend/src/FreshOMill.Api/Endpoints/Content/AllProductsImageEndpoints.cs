using FreshOMill.Application.Content;
using FreshOMill.Application.Content.Admin;
using MediatR;

namespace FreshOMill.Api.Endpoints.Content;

public static class AllProductsImageEndpoints
{
    public static IEndpointRouteBuilder MapAllProductsImageEndpoints(this IEndpointRouteBuilder app)
    {
        // Public — read by the storefront's "All Products" category chip/filter.
        app.MapGet("/api/v1/all-products-image", async (ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new GetAllProductsImageQuery(), cancellationToken)))
            .WithName("GetAllProductsImage")
            .WithTags("Content")
            .Produces<AllProductsImageDto>();

        // Admin-only write.
        app.MapPut("/api/v1/admin/all-products-image", async (UpdateAllProductsImageCommand command, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(command, cancellationToken)))
            .WithName("UpdateAllProductsImage")
            .WithTags("Admin")
            .RequireAuthorization("Admin")
            .Produces<AllProductsImageDto>();

        return app;
    }
}
