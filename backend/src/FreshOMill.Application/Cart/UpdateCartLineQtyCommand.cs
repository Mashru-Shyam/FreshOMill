using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;

namespace FreshOMill.Application.Cart;

public sealed record UpdateCartLineQtyCommand(Guid LineId, int Qty) : IRequest<CartDto>;

/// <summary>Qty &lt; 1 removes the line entirely — mirrors CartService.setQty() on the frontend.</summary>
public sealed class UpdateCartLineQtyCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<UpdateCartLineQtyCommand, CartDto>
{
    public Task<CartDto> Handle(UpdateCartLineQtyCommand request, CancellationToken cancellationToken) =>
        CartHelpers.WithRetryAsync(context, () => ExecuteAsync(request, cancellationToken));

    private async Task<CartDto> ExecuteAsync(UpdateCartLineQtyCommand request, CancellationToken cancellationToken)
    {
        var cart = await CartHelpers.GetOrCreateCartAsync(context, currentUser.UserId!.Value, cancellationToken);

        var line = cart.Lines.FirstOrDefault(l => l.Id == request.LineId)
            ?? throw new NotFoundException("Cart line not found.");

        if (request.Qty < 1)
        {
            cart.Lines.Remove(line);
            context.CartLines.Remove(line);
        }
        else
        {
            line.Qty = request.Qty;
        }

        await context.SaveChangesAsync(cancellationToken);
        return CartHelpers.ToDto(cart);
    }
}
