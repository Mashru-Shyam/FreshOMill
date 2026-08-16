using FluentValidation;

namespace FreshOMill.Application.Addresses;

/// <summary>Mirrors frontend/src/app/shared/util/address-validation.ts exactly — same rules,
/// enforced again here since the client-side check isn't a trust boundary.</summary>
public sealed class CreateAddressCommandValidator : AbstractValidator<CreateAddressCommand>
{
    public CreateAddressCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Phone).Matches("^[0-9]{10}$").WithMessage("Enter a valid 10-digit phone number.");
        RuleFor(x => x.AddressLine1).NotEmpty().MaximumLength(300);
        RuleFor(x => x.AddressLine2).MaximumLength(300);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.State).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Pincode).Matches("^[0-9]{6}$").WithMessage("Enter a valid 6-digit pincode.");
    }
}
