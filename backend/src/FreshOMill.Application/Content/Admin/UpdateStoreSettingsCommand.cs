using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
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
        var settings = await context.StoreSettings.FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("Store settings have not been configured.");

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
