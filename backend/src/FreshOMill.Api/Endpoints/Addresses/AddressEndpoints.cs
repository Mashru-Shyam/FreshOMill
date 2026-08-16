using FreshOMill.Application.Addresses;
using MediatR;

namespace FreshOMill.Api.Endpoints.Addresses;

public static class AddressEndpoints
{
    public static IEndpointRouteBuilder MapAddressEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/addresses").WithTags("Addresses").RequireAuthorization();

        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new GetAddressesQuery(), cancellationToken)))
            .WithName("GetAddresses")
            .Produces<IReadOnlyList<AddressDto>>();

        group.MapPost("/", async (CreateAddressCommand command, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(command, cancellationToken)))
            .WithName("CreateAddress")
            .Produces<AddressDto>();

        group.MapPut("/{id:guid}", async (Guid id, UpdateAddressRequest request, ISender sender, CancellationToken cancellationToken) =>
        {
            var command = new UpdateAddressCommand(
                id, request.FullName, request.Phone, request.AddressLine1, request.AddressLine2,
                request.City, request.State, request.Pincode);
            return Results.Ok(await sender.Send(command, cancellationToken));
        })
        .WithName("UpdateAddress")
        .Produces<AddressDto>();

        group.MapDelete("/{id:guid}", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
        {
            await sender.Send(new DeleteAddressCommand(id), cancellationToken);
            return Results.NoContent();
        })
        .WithName("DeleteAddress");

        group.MapPost("/{id:guid}/default", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
        {
            await sender.Send(new SetDefaultAddressCommand(id), cancellationToken);
            return Results.NoContent();
        })
        .WithName("SetDefaultAddress");

        return app;
    }
}

public sealed record UpdateAddressRequest(
    string FullName,
    string Phone,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string Pincode);
