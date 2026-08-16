using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Domain.Addresses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Addresses;

public sealed record CreateAddressCommand(
    string FullName,
    string Phone,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string Pincode,
    bool MakeDefault) : IRequest<AddressDto>;

public sealed class CreateAddressCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<CreateAddressCommand, AddressDto>
{
    public async Task<AddressDto> Handle(CreateAddressCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId!.Value;

        // First address for this user is always the default, same as AddressService.add() on the frontend.
        var hasExisting = await context.Addresses.AnyAsync(a => a.UserId == userId, cancellationToken);
        var isDefault = request.MakeDefault || !hasExisting;

        if (isDefault)
        {
            await UnsetExistingDefaultAsync(context, userId, cancellationToken);
        }

        var address = new Address
        {
            UserId = userId,
            FullName = request.FullName,
            Phone = request.Phone,
            AddressLine1 = request.AddressLine1,
            AddressLine2 = request.AddressLine2,
            City = request.City,
            State = request.State,
            Pincode = request.Pincode,
            IsDefault = isDefault,
        };

        context.Addresses.Add(address);
        await context.SaveChangesAsync(cancellationToken);

        return ToDto(address);
    }

    internal static async Task UnsetExistingDefaultAsync(IApplicationDbContext context, Guid userId, CancellationToken cancellationToken)
    {
        var current = await context.Addresses
            .Where(a => a.UserId == userId && a.IsDefault)
            .ToListAsync(cancellationToken);

        foreach (var address in current)
        {
            address.IsDefault = false;
        }
    }

    internal static AddressDto ToDto(Address address) =>
        new(address.Id, address.FullName, address.Phone, address.AddressLine1, address.AddressLine2, address.City, address.State, address.Pincode, address.IsDefault);
}
