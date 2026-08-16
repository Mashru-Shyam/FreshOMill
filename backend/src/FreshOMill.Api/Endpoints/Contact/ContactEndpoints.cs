using FreshOMill.Application.Contact;
using MediatR;
using Microsoft.AspNetCore.RateLimiting;

namespace FreshOMill.Api.Endpoints.Contact;

public static class ContactEndpoints
{
    public static IEndpointRouteBuilder MapContactEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/contact").WithTags("Contact");

        group.MapPost("/", async (SubmitContactMessageCommand command, ISender sender, CancellationToken cancellationToken) =>
        {
            await sender.Send(command, cancellationToken);
            return Results.NoContent();
        })
        .WithName("SubmitContactMessage")
        .AllowAnonymous()
        .RequireRateLimiting("contact");

        return app;
    }
}
