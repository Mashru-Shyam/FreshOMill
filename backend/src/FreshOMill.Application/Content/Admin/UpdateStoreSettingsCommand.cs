using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Domain.Content;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Content.Admin;

public sealed record UpdateStoreSettingsCommand(
    string Address,
    string Phone,
    string WhatsAppNumber,
    string Email,
    string OpeningHours,
    string? InstagramUrl,
    string? YoutubeUrl,
    string? LinkedInUrl,
    string? GoogleMapsUrl) : IRequest<StoreSettingsDto>;

public sealed class UpdateStoreSettingsCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateStoreSettingsCommand, StoreSettingsDto>
{
    public async Task<StoreSettingsDto> Handle(UpdateStoreSettingsCommand request, CancellationToken cancellationToken)
    {
        var settings = await context.StoreSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings is null)
        {
            settings = new StoreSettings
            {
                Address = request.Address,
                Phone = request.Phone,
                WhatsAppNumber = request.WhatsAppNumber,
                Email = request.Email,
                OpeningHours = request.OpeningHours,
                InstagramUrl = request.InstagramUrl,
                YoutubeUrl = request.YoutubeUrl,
                LinkedInUrl = request.LinkedInUrl,
                GoogleMapsUrl = request.GoogleMapsUrl,
            };
            context.StoreSettings.Add(settings);
            await context.SaveChangesAsync(cancellationToken);

            return new StoreSettingsDto(
                settings.Address,
                settings.Phone,
                settings.WhatsAppNumber,
                settings.Email,
                settings.OpeningHours,
                settings.InstagramUrl,
                settings.YoutubeUrl,
                settings.LinkedInUrl,
                settings.GoogleMapsUrl);
        }

        settings.Address = request.Address;
        settings.Phone = request.Phone;
        settings.WhatsAppNumber = request.WhatsAppNumber;
        settings.Email = request.Email;
        settings.OpeningHours = request.OpeningHours;
        settings.InstagramUrl = request.InstagramUrl;
        settings.YoutubeUrl = request.YoutubeUrl;
        settings.LinkedInUrl = request.LinkedInUrl;
        settings.GoogleMapsUrl = request.GoogleMapsUrl;

        await context.SaveChangesAsync(cancellationToken);

        return new StoreSettingsDto(
            settings.Address,
            settings.Phone,
            settings.WhatsAppNumber,
            settings.Email,
            settings.OpeningHours,
            settings.InstagramUrl,
            settings.YoutubeUrl,
            settings.LinkedInUrl,
            settings.GoogleMapsUrl);
    }
}
