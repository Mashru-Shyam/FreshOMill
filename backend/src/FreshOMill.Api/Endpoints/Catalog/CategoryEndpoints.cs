using FreshOMill.Application.Catalog;
using MediatR;

namespace FreshOMill.Api.Endpoints.Catalog;

public static class CategoryEndpoints
{
    public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/categories", async (ISender sender, CancellationToken cancellationToken) =>
        {
            var categories = await sender.Send(new GetCategoriesQuery(), cancellationToken);
            return Results.Ok(categories);
        })
        .WithName("GetCategories")
        .WithTags("Catalog")
        .Produces<IReadOnlyList<CategoryDto>>();

        return app;
    }
}
