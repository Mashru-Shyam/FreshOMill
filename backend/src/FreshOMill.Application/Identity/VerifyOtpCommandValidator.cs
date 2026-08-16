using FluentValidation;

namespace FreshOMill.Application.Identity;

public sealed class VerifyOtpCommandValidator : AbstractValidator<VerifyOtpCommand>
{
    public VerifyOtpCommandValidator()
    {
        RuleFor(x => x.ChallengeId).NotEmpty();
        RuleFor(x => x.Code).Matches("^[0-9]{6}$").WithMessage("Code must be 6 digits.");
    }
}
