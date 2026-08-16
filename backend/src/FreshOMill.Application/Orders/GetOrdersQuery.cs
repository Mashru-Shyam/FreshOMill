using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Orders;

public sealed record GetOrdersQuery : IRequest<IReadOnlyList<OrderDto>>;

public sealed class GetOrdersQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<GetOrdersQuery, IReadOnlyList<OrderDto>>
{
    public async Task<IReadOnlyList<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await context.Orders
            .Include(o => o.Items)
            .Where(o => o.UserId == currentUser.UserId)
            .OrderByDescending(o => o.PlacedAt)
            .ToListAsync(cancellationToken);

        return orders.Select(OrderMapper.ToDto).ToList();
    }
}
