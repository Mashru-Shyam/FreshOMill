using FluentValidation;

namespace FreshOMill.Application.Content.Admin;

public sealed class UpdateHeroSlideCommandValidator : AbstractValidator<UpdateHeroSlideCommand>
{
    public UpdateHeroSlideCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ImageUrl).MaximumLength(500);
        RuleFor(x => x.Alt).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Icon).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Subtitle).NotEmpty().MaximumLength(300);
        RuleFor(x => x.FallbackGradient).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DisplayOrder).GreaterThanOrEqualTo(0);
    }
}
