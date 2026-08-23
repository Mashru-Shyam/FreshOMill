using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Content;

/// <summary>Public — the storefront's navbar/footer/Contact page/WhatsApp button all read this on
/// every visit, same as categories/products. There is always exactly one row (seeded by
/// StoreSettingsConfiguration), so a missing row means the seed itself is broken, not a normal
/// 404 a caller should ever see.</summary>
public sealed record GetStoreSettingsQuery : IRequest<StoreSettingsDto>;

public sealed class GetStoreSettingsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetStoreSettingsQuery, StoreSettingsDto>
{
    public async Task<StoreSettingsDto> Handle(GetStoreSettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await context.StoreSettings.FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("Store settings have not been configured.");

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
