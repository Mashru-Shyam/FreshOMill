using FluentValidation;

namespace FreshOMill.Application.Content.Admin;

public sealed class UpdateStoreSettingsCommandValidator : AbstractValidator<UpdateStoreSettingsCommand>
{
    public UpdateStoreSettingsCommandValidator()
    {
        RuleFor(x => x.Address).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(30);
        RuleFor(x => x.WhatsAppNumber).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.OpeningHours).NotEmpty().MaximumLength(200);
        RuleFor(x => x.InstagramUrl).MaximumLength(300);
        RuleFor(x => x.YoutubeUrl).MaximumLength(300);
        RuleFor(x => x.LinkedInUrl).MaximumLength(300);
        RuleFor(x => x.GoogleMapsUrl).MaximumLength(300);
    }
}
