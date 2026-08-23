using FreshOMill.Application.Content;
using FreshOMill.Application.Content.Admin;
using MediatR;

namespace FreshOMill.Api.Endpoints.Content;

public static class StoreSettingsEndpoints
{
    public static IEndpointRouteBuilder MapStoreSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        // Public — read by the storefront's navbar/footer/Contact page/WhatsApp button.
        app.MapGet("/api/v1/store-settings", async (ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new GetStoreSettingsQuery(), cancellationToken)))
            .WithName("GetStoreSettings")
            .WithTags("Content")
            .Produces<StoreSettingsDto>();

        // Admin-only write.
        app.MapPut("/api/v1/admin/store-settings", async (UpdateStoreSettingsCommand command, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(command, cancellationToken)))
            .WithName("UpdateStoreSettings")
            .WithTags("Admin")
            .RequireAuthorization("Admin")
            .Produces<StoreSettingsDto>();

        return app;
    }
}
