using FluentValidation;

namespace FreshOMill.Application.Content.Admin;

public sealed class UpdateAllProductsImageCommandValidator : AbstractValidator<UpdateAllProductsImageCommand>
{
    public UpdateAllProductsImageCommandValidator()
    {
        RuleFor(x => x.ImageUrl).MaximumLength(500);
    }
}
