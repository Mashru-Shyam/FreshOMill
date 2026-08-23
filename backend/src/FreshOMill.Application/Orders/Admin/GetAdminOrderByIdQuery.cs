using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Orders.Admin;

public sealed record GetAdminOrderByIdQuery(Guid Id) : IRequest<AdminOrderDto>;

public sealed class GetAdminOrderByIdQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetAdminOrderByIdQuery, AdminOrderDto>
{
    public async Task<AdminOrderDto> Handle(GetAdminOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var order = await context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Order not found.");

        var email = await context.Users
            .Where(u => u.Id == order.UserId)
            .Select(u => u.Email)
            .FirstOrDefaultAsync(cancellationToken) ?? "(unknown)";

        return AdminOrderMapper.ToDto(order, email);
    }
}
