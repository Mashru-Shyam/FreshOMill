using FluentValidation;

namespace FreshOMill.Application.Orders;

public sealed class PlaceOrderCommandValidator : AbstractValidator<PlaceOrderCommand>
{
    public PlaceOrderCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Phone).Matches("^[0-9]{10}$").WithMessage("Enter a valid 10-digit phone number.");
        RuleFor(x => x.AddressLine1).NotEmpty().MaximumLength(300);
        RuleFor(x => x.AddressLine2).MaximumLength(300);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.State).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Pincode).Matches("^[0-9]{6}$").WithMessage("Enter a valid 6-digit pincode.");
        RuleFor(x => x.PaymentMethod).IsInEnum();
        RuleFor(x => x.Items).NotEmpty().WithMessage("Cannot place an order with no items.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.Name).NotEmpty().MaximumLength(200);
            item.RuleFor(i => i.Variant).NotEmpty().MaximumLength(100);
            item.RuleFor(i => i.UnitPrice).GreaterThan(0);
            item.RuleFor(i => i.Qty).GreaterThan(0);
        });
    }
}
