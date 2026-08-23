using FluentValidation;
using FreshOMill.Domain.Orders;

namespace FreshOMill.Application.Orders.Admin;

public sealed class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    private static readonly OrderStatus[] AllowedTargets =
    [
        OrderStatus.Placed, OrderStatus.Shipped, OrderStatus.Delivered, OrderStatus.Cancelled,
    ];

    public UpdateOrderStatusCommandValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty();
        RuleFor(x => x.NewStatus)
            .Must(status => AllowedTargets.Contains(status))
            .WithMessage("Status must be one of Placed, Shipped, Delivered, or Cancelled.");
    }
}
