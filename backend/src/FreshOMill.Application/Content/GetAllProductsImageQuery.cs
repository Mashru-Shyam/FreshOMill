using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Content;

public sealed record GetAllProductsImageQuery : IRequest<AllProductsImageDto>;

public sealed class GetAllProductsImageQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAllProductsImageQuery, AllProductsImageDto>
{
    public async Task<AllProductsImageDto> Handle(GetAllProductsImageQuery request, CancellationToken cancellationToken)
    {
        var settings = await context.StoreSettings.FirstOrDefaultAsync(cancellationToken);
        return new AllProductsImageDto(settings?.AllProductsImageUrl);
    }
}
