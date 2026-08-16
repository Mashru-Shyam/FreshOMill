using FreshOMill.Application.Content;
using MediatR;

namespace FreshOMill.Api.Endpoints.Content;

public static class HeroSlideEndpoints
{
    public static IEndpointRouteBuilder MapHeroSlideEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/hero-slides", async (ISender sender, CancellationToken cancellationToken) =>
        {
            var slides = await sender.Send(new GetHeroSlidesQuery(), cancellationToken);
            return Results.Ok(slides);
        })
        .WithName("GetHeroSlides")
        .WithTags("Content")
        .Produces<IReadOnlyList<HeroSlideDto>>();

        return app;
    }
}
