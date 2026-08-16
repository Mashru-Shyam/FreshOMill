using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Addresses;

public sealed record SetDefaultAddressCommand(Guid Id) : IRequest<Unit>;

public sealed class SetDefaultAddressCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<SetDefaultAddressCommand, Unit>
{
    public async Task<Unit> Handle(SetDefaultAddressCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId!.Value;

        var address = await context.Addresses
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.UserId == userId, cancellationToken)
            ?? throw new NotFoundException("Address not found.");

        await CreateAddressCommandHandler.UnsetExistingDefaultAsync(context, userId, cancellationToken);
        address.IsDefault = true;

        await context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
