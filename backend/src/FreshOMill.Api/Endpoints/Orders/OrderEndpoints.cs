using FreshOMill.Application.Orders;
using MediatR;

namespace FreshOMill.Api.Endpoints.Orders;

public static class OrderEndpoints
{
    public static IEndpointRouteBuilder MapOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/orders").WithTags("Orders").RequireAuthorization();

        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(new GetOrdersQuery(), cancellationToken)))
            .WithName("GetOrders")
            .Produces<IReadOnlyList<OrderDto>>();

        group.MapPost("/", async (PlaceOrderCommand command, ISender sender, CancellationToken cancellationToken) =>
            Results.Ok(await sender.Send(command, cancellationToken)))
            .WithName("PlaceOrder")
            .Produces<OrderDto>();

        group.MapPost("/{id:guid}/payment/verify", async (Guid id, VerifyPaymentRequest request, ISender sender, CancellationToken cancellationToken) =>
        {
            var command = new VerifyPaymentCommand(id, request.RazorpayOrderId, request.RazorpayPaymentId, request.RazorpaySignature);
            return Results.Ok(await sender.Send(command, cancellationToken));
        })
        .WithName("VerifyPayment")
        .Produces<OrderDto>();

        return app;
    }
}

public sealed record VerifyPaymentRequest(string RazorpayOrderId, string RazorpayPaymentId, string RazorpaySignature);
