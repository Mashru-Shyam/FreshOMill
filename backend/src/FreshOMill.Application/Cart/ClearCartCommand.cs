using FreshOMill.Application.Common.Interfaces;
using MediatR;

namespace FreshOMill.Application.Cart;

public sealed record ClearCartCommand : IRequest<Unit>;

public sealed class ClearCartCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<ClearCartCommand, Unit>
{
    public Task<Unit> Handle(ClearCartCommand request, CancellationToken cancellationToken) =>
        CartHelpers.WithRetryAsync(context, () => ExecuteAsync(cancellationToken));

    private async Task<Unit> ExecuteAsync(CancellationToken cancellationToken)
    {
        var cart = await CartHelpers.GetOrCreateCartAsync(context, currentUser.UserId!.Value, cancellationToken);

        context.CartLines.RemoveRange(cart.Lines);
        cart.Lines.Clear();

        await context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
