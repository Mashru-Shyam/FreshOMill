using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Addresses;

public sealed record DeleteAddressCommand(Guid Id) : IRequest<Unit>;

public sealed class DeleteAddressCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<DeleteAddressCommand, Unit>
{
    public async Task<Unit> Handle(DeleteAddressCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId!.Value;

        var address = await context.Addresses
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Address not found.");

        var wasDefault = address.IsDefault;
        context.Addresses.Remove(address);
        await context.SaveChangesAsync(cancellationToken);

        // If the default address was removed, promote whichever one's left to default —
        // mirrors AddressService.remove() on the frontend.
        if (wasDefault)
        {
            var next = await context.Addresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Created)
                .FirstOrDefaultAsync(cancellationToken);

            if (next is not null)
            {
                next.IsDefault = true;
                await context.SaveChangesAsync(cancellationToken);
            }
        }

        return Unit.Value;
    }
}
