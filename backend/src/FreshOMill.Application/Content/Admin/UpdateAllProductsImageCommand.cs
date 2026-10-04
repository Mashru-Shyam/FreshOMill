using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Domain.Content;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Content.Admin;

public sealed record UpdateAllProductsImageCommand(string? ImageUrl) : IRequest<AllProductsImageDto>;

public sealed class UpdateAllProductsImageCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateAllProductsImageCommand, AllProductsImageDto>
{
    public async Task<AllProductsImageDto> Handle(UpdateAllProductsImageCommand request, CancellationToken cancellationToken)
    {
        var settings = await context.StoreSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings is null)
        {
            settings = new StoreSettings
            {
                Address = "",
                Phone = "",
                WhatsAppNumber = "",
                Email = "",
                OpeningHours = "",
                AllProductsImageUrl = request.ImageUrl,
            };
            context.StoreSettings.Add(settings);
        }
        else
        {
            settings.AllProductsImageUrl = request.ImageUrl;
        }

        await context.SaveChangesAsync(cancellationToken);

        return new AllProductsImageDto(settings.AllProductsImageUrl);
    }
}
