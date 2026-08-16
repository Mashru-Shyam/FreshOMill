using FreshOMill.Application.Content;
using MediatR;

namespace FreshOMill.Api.Endpoints.Content;

public static class TestimonialEndpoints
{
    public static IEndpointRouteBuilder MapTestimonialEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/testimonials", async (ISender sender, CancellationToken cancellationToken) =>
        {
            var testimonials = await sender.Send(new GetTestimonialsQuery(), cancellationToken);
            return Results.Ok(testimonials);
        })
        .WithName("GetTestimonials")
        .WithTags("Content")
        .Produces<IReadOnlyList<TestimonialDto>>();

        return app;
    }
}
