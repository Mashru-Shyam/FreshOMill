using FluentValidation;

namespace FreshOMill.Application.Contact;

public sealed class SubmitContactMessageCommandValidator : AbstractValidator<SubmitContactMessageCommand>
{
    public SubmitContactMessageCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(320);
        RuleFor(x => x.Phone).MaximumLength(20);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(4000);
    }
}
