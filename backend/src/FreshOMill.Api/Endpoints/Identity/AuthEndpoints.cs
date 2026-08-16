using FreshOMill.Application.Identity;
using MediatR;

namespace FreshOMill.Api.Endpoints.Identity;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth").WithTags("Auth");

        group.MapPost("/otp/request", async (RequestOtpCommand command, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(command, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("RequestOtp")
        .RequireRateLimiting("otp")
        .Produces<RequestOtpResult>();

        group.MapPost("/otp/verify", async (VerifyOtpCommand command, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(command, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("VerifyOtp")
        .Produces<AuthResponseDto>();

        group.MapPost("/refresh", async (RefreshTokenCommand command, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(command, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("RefreshToken")
        .Produces<AuthResponseDto>();

            group.MapPost("/logout", async (LogoutCommand command, ISender sender, CancellationToken cancellationToken) =>
        {
            await sender.Send(command, cancellationToken);
            return Results.NoContent();
        })
        .WithName("Logout");

        return app;
    }
}
