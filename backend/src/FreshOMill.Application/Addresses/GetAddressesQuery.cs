using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Addresses;

public sealed record GetAddressesQuery : IRequest<IReadOnlyList<AddressDto>>;

public sealed class GetAddressesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<GetAddressesQuery, IReadOnlyList<AddressDto>>
{
    public async Task<IReadOnlyList<AddressDto>> Handle(GetAddressesQuery request, CancellationToken cancellationToken) =>
        await context.Addresses
            .Where(a => a.UserId == currentUser.UserId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.Created)
            .Select(a => new AddressDto(a.Id, a.FullName, a.Phone, a.AddressLine1, a.AddressLine2, a.City, a.State, a.Pincode, a.IsDefault))
            .ToListAsync(cancellationToken);
}
