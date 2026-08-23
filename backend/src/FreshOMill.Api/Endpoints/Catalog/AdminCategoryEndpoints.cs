using FreshOMill.Application.Catalog;
using FreshOMill.Application.Catalog.Admin;
using MediatR;

namespace FreshOMill.Api.Endpoints.Catalog;

public static class AdminCategoryEndpoints
{
    public static IEndpointRouteBuilder MapAdminCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin/categories").WithTags("Admin").RequireAuthorization("Admin");

        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new GetAdminCategoriesQuery(), cancellationToken)))
            .WithName("GetAdminCategories")
            .Produces<IReadOnlyList<AdminCategoryDto>>();

        group.MapPost("/", async (CreateCategoryCommand command, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(command, cancellationToken)))
            .WithName("CreateCategory")
            .Produces<CategoryDto>();

        group.MapPut("/{id:guid}", async (Guid id, UpdateCategoryRequest request, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new UpdateCategoryCommand(id, request.Name, request.ImageUrl, request.DisplayOrder), cancellationToken)))
            .WithName("UpdateCategory")
            .Produces<CategoryDto>();

        group.MapDelete("/{id:guid}", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
        {
            await sender.Send(new DeleteCategoryCommand(id), cancellationToken);
            return Results.NoContent();
        })
        .WithName("DeleteCategory");

        return app;
    }
}

public sealed record UpdateCategoryRequest(string Name, string? ImageUrl, int DisplayOrder);
