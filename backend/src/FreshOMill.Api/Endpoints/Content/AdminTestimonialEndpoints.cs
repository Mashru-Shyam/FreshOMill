using FreshOMill.Application.Content.Admin;
using MediatR;

namespace FreshOMill.Api.Endpoints.Content;

public static class AdminTestimonialEndpoints
{
    public static IEndpointRouteBuilder MapAdminTestimonialEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin/testimonials").WithTags("Admin").RequireAuthorization("Admin");

        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new GetAdminTestimonialsQuery(), cancellationToken)))
            .WithName("GetAdminTestimonials")
            .Produces<IReadOnlyList<AdminTestimonialDto>>();

        group.MapPost("/", async (CreateTestimonialCommand command, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(command, cancellationToken)))
            .WithName("CreateTestimonial")
            .Produces<AdminTestimonialDto>();

        group.MapPut("/{id:guid}", async (Guid id, UpdateTestimonialRequest request, ISender sender, CancellationToken cancellationToken) =>
        {
            var command = new UpdateTestimonialCommand(id, request.Name, request.Text, request.VideoUrl, request.DisplayOrder);
            return Results.Ok(await sender.Send(command, cancellationToken));
        })
        .WithName("UpdateTestimonial")
        .Produces<AdminTestimonialDto>();

        group.MapDelete("/{id:guid}", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
        {
            await sender.Send(new DeleteTestimonialCommand(id), cancellationToken);
            return Results.NoContent();
        })
        .WithName("DeleteTestimonial");

        return app;
    }
}

public sealed record UpdateTestimonialRequest(string Name, string Text, string? VideoUrl, int DisplayOrder);
