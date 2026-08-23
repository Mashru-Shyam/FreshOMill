using FluentValidation;

namespace FreshOMill.Application.Catalog.Admin;

public sealed class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.Unit).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Description).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.Popularity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Variants).NotEmpty().WithMessage("A product needs at least one pack size.");

        RuleForEach(x => x.Variants).ChildRules(variant =>
        {
            variant.RuleFor(v => v.Label).NotEmpty().MaximumLength(50);
            variant.RuleFor(v => v.Price).GreaterThan(0);
            variant.RuleFor(v => v.StockQuantity).GreaterThanOrEqualTo(0);
        });

        RuleForEach(x => x.ImageUrls).MaximumLength(500);
    }
}
