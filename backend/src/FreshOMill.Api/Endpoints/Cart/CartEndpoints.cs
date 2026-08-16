using FreshOMill.Application.Cart;
using MediatR;

namespace FreshOMill.Api.Endpoints.Cart;

public static class CartEndpoints
{
    public static IEndpointRouteBuilder MapCartEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/cart").WithTags("Cart").RequireAuthorization();

        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new GetCartQuery(), cancellationToken)))
            .WithName("GetCart")
            .Produces<CartDto>();

        group.MapPost("/lines", async (AddCartLineCommand command, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(command, cancellationToken)))
            .WithName("AddCartLine")
            .Produces<CartDto>();

        group.MapPut("/lines/{id:guid}", async (Guid id, UpdateCartLineQtyRequest request, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new UpdateCartLineQtyCommand(id, request.Qty), cancellationToken)))
            .WithName("UpdateCartLineQty")
            .Produces<CartDto>();

        group.MapDelete("/lines/{id:guid}", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new RemoveCartLineCommand(id), cancellationToken)))
            .WithName("RemoveCartLine")
            .Produces<CartDto>();

        group.MapDelete("/", async (ISender sender, CancellationToken cancellationToken) =>
        {
            await sender.Send(new ClearCartCommand(), cancellationToken);
            return Results.NoContent();
        })
        .WithName("ClearCart");

        return app;
    }
}

public sealed record UpdateCartLineQtyRequest(int Qty);
