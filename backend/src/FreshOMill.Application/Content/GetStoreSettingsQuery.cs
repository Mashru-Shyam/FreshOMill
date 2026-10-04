using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Content;

/// <summary>Public — the storefront's navbar/footer/Contact page/WhatsApp button all read this on
/// every visit. No row exists until an admin saves the Settings screen at least once, so this
/// returns an all-empty DTO rather than a 404 in that case — the storefront components already
/// render fine with blank contact info, and a public 404 for "not configured yet" isn't useful.</summary>
public sealed record GetStoreSettingsQuery : IRequest<StoreSettingsDto>;

public sealed class GetStoreSettingsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetStoreSettingsQuery, StoreSettingsDto>
{
    private static readonly StoreSettingsDto Empty = new("", "", "", "", "", null, null, null, null);

    public async Task<StoreSettingsDto> Handle(GetStoreSettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await context.StoreSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings is null)
        {
            return Empty;
        }

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
