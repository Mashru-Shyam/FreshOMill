using FluentValidation;

namespace FreshOMill.Application.Content.Admin;

public sealed class CreateTestimonialCommandValidator : AbstractValidator<CreateTestimonialCommand>
{
    public CreateTestimonialCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Text).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.VideoUrl).MaximumLength(500);
        RuleFor(x => x.DisplayOrder).GreaterThanOrEqualTo(0);
    }
}
