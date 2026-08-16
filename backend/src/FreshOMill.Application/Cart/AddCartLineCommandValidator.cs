using FluentValidation;

namespace FreshOMill.Application.Cart;

public sealed class AddCartLineCommandValidator : AbstractValidator<AddCartLineCommand>
{
    public AddCartLineCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Variant).NotEmpty().MaximumLength(100);
        RuleFor(x => x.UnitPrice).GreaterThan(0);
        RuleFor(x => x.Qty).GreaterThan(0);
    }
}
