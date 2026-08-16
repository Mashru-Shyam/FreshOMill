using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;

namespace FreshOMill.Application.Cart;

public sealed record RemoveCartLineCommand(Guid LineId) : IRequest<CartDto>;

public sealed class RemoveCartLineCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<RemoveCartLineCommand, CartDto>
{
    public Task<CartDto> Handle(RemoveCartLineCommand request, CancellationToken cancellationToken) =>
        CartHelpers.WithRetryAsync(context, () => ExecuteAsync(request, cancellationToken));

    private async Task<CartDto> ExecuteAsync(RemoveCartLineCommand request, CancellationToken cancellationToken)
    {
        var cart = await CartHelpers.GetOrCreateCartAsync(context, currentUser.UserId!.Value, cancellationToken);

        var line = cart.Lines.FirstOrDefault(l => l.Id == request.LineId)
            ?? throw new NotFoundException("Cart line not found.");

        cart.Lines.Remove(line);
        context.CartLines.Remove(line);

        await context.SaveChangesAsync(cancellationToken);
        return CartHelpers.ToDto(cart);
    }
}
