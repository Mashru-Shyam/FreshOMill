using FreshOMill.Application.Common.Interfaces;
using MediatR;

namespace FreshOMill.Application.Cart;

public sealed record GetCartQuery : IRequest<CartDto>;

public sealed class GetCartQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<GetCartQuery, CartDto>
{
    public async Task<CartDto> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var cart = await CartHelpers.GetOrCreateCartAsync(context, currentUser.UserId!.Value, cancellationToken);
        return CartHelpers.ToDto(cart);
    }
}
