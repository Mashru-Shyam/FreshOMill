using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Addresses;

public sealed record UpdateAddressCommand(
    Guid Id,
    string FullName,
    string Phone,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string Pincode) : IRequest<AddressDto>;

public sealed class UpdateAddressCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<UpdateAddressCommand, AddressDto>
{
    public async Task<AddressDto> Handle(UpdateAddressCommand request, CancellationToken cancellationToken)
    {
        var address = await context.Addresses
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.UserId == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("Address not found.");

        address.FullName = request.FullName;
        address.Phone = request.Phone;
        address.AddressLine1 = request.AddressLine1;
        address.AddressLine2 = request.AddressLine2;
        address.City = request.City;
        address.State = request.State;
        address.Pincode = request.Pincode;

        await context.SaveChangesAsync(cancellationToken);

        return CreateAddressCommandHandler.ToDto(address);
    }
}
