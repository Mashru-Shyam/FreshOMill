using FreshOMill.Application.Orders;
using MediatR;

namespace FreshOMill.Api.Endpoints.Payments;

public static class PaymentWebhookEndpoints
{
    public static IEndpointRouteBuilder MapPaymentWebhookEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/payments").WithTags("Payments");
        group.MapPost("/webhook", async (HttpRequest httpRequest, ISender sender, CancellationToken cancellationToken) =>
        {
            using var reader = new StreamReader(httpRequest.Body);
            var rawBody = await reader.ReadToEndAsync(cancellationToken);
            var signature = httpRequest.Headers["X-Razorpay-Signature"].ToString();

            await sender.Send(new HandleRazorpayWebhookCommand(rawBody, signature), cancellationToken);
            return Results.Ok();
        })
        .WithName("RazorpayWebhook")
        .AllowAnonymous();

        return app;
    }
}
