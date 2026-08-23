using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Orders.Admin;

/// <summary>Every order across every customer, newest first — GetOrdersQuery (customer-facing)
/// scopes to the signed-in user; this is the same query without that filter, plus the
/// customer's email joined in since an admin needs to know whose order they're looking at.</summary>
public sealed record GetAdminOrdersQuery : IRequest<IReadOnlyList<AdminOrderDto>>;

public sealed class GetAdminOrdersQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminOrdersQuery, IReadOnlyList<AdminOrderDto>>
{
    public async Task<IReadOnlyList<AdminOrderDto>> Handle(GetAdminOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await context.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.PlacedAt)
            .ToListAsync(cancellationToken);

        var userIds = orders.Select(o => o.UserId).Distinct().ToList();
        var emailsByUserId = await context.Users
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.Email, cancellationToken);

        return orders
            .Select(o => AdminOrderMapper.ToDto(o, emailsByUserId.GetValueOrDefault(o.UserId, "(unknown)")))
            .ToList();
    }
}
