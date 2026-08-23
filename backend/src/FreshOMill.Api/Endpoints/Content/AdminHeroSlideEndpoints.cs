using FreshOMill.Application.Content.Admin;
using MediatR;

namespace FreshOMill.Api.Endpoints.Content;

public static class AdminHeroSlideEndpoints
{
    public static IEndpointRouteBuilder MapAdminHeroSlideEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin/hero-slides").WithTags("Admin").RequireAuthorization("Admin");

        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new GetAdminHeroSlidesQuery(), cancellationToken)))
            .WithName("GetAdminHeroSlides")
            .Produces<IReadOnlyList<AdminHeroSlideDto>>();

        group.MapPost("/", async (CreateHeroSlideCommand command, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(command, cancellationToken)))
            .WithName("CreateHeroSlide")
            .Produces<AdminHeroSlideDto>();

        group.MapPut("/{id:guid}", async (Guid id, UpdateHeroSlideRequest request, ISender sender, CancellationToken cancellationToken) =>
        {
            var command = new UpdateHeroSlideCommand(
                id, request.ImageUrl, request.Alt, request.Icon, request.Title, request.Subtitle,
                request.FallbackGradient, request.DisplayOrder);
            return Results.Ok(await sender.Send(command, cancellationToken));
        })
        .WithName("UpdateHeroSlide")
        .Produces<AdminHeroSlideDto>();

        group.MapDelete("/{id:guid}", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
        {
            await sender.Send(new DeleteHeroSlideCommand(id), cancellationToken);
            return Results.NoContent();
        })
        .WithName("DeleteHeroSlide");

        return app;
    }
}

public sealed record UpdateHeroSlideRequest(
    string? ImageUrl,
    string Alt,
    string Icon,
    string Title,
    string Subtitle,
    string FallbackGradient,
    int DisplayOrder);
