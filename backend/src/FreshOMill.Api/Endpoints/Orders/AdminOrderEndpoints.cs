using FreshOMill.Application.Orders.Admin;
using FreshOMill.Domain.Orders;
using MediatR;

namespace FreshOMill.Api.Endpoints.Orders;

public static class AdminOrderEndpoints
{
    public static IEndpointRouteBuilder MapAdminOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/admin/orders").WithTags("Admin").RequireAuthorization("Admin");

        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new GetAdminOrdersQuery(), cancellationToken)))
            .WithName("GetAdminOrders")
            .Produces<IReadOnlyList<AdminOrderDto>>();

        group.MapGet("/{id:guid}", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new GetAdminOrderByIdQuery(id), cancellationToken)))
            .WithName("GetAdminOrderById")
            .Produces<AdminOrderDto>();

        group.MapPut("/{id:guid}/status", async (Guid id, UpdateOrderStatusRequest request, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new UpdateOrderStatusCommand(id, request.Status), cancellationToken)))
            .WithName("UpdateOrderStatus")
            .Produces<AdminOrderDto>();

        return app;
    }
}

public sealed record UpdateOrderStatusRequest(OrderStatus Status);
