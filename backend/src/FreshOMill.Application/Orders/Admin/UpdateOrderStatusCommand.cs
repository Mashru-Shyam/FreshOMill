using FreshOMill.Application.Common.Exceptions;
using FreshOMill.Application.Common.Interfaces;
using FreshOMill.Domain.Orders;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Application.Orders.Admin;

/// <summary>The missing piece flagged in the Admin Panel plan — OrderStatus already had
/// Placed/Shipped/Delivered/Cancelled, but nothing could ever move an order between them after
/// PlaceOrderCommand created it. Restricted to those four target states (see the validator) —
/// PendingPayment/PaymentFailed are payment-flow-only states an admin should never set by hand.</summary>
public sealed record UpdateOrderStatusCommand(Guid OrderId, OrderStatus NewStatus) : IRequest<AdminOrderDto>;

public sealed class UpdateOrderStatusCommandHandler(IApplicationDbContext context)
    : IRequestHandler<UpdateOrderStatusCommand, AdminOrderDto>
{
    public async Task<AdminOrderDto> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Order not found.");

        // Cancelling an order that already reserved stock (anything past PendingPayment) restores
        // it — mirror image of HandleRazorpayWebhookCommand's RestockAsync for a failed payment,
        // just triggered by an admin action instead of a gateway callback.
        var wasStockReserved = order.Status is OrderStatus.Placed or OrderStatus.Shipped or OrderStatus.Delivered;
        if (request.NewStatus == OrderStatus.Cancelled && wasStockReserved)
        {
            await RestockAsync(order, cancellationToken);
        }

        order.Status = request.NewStatus;
        await context.SaveChangesAsync(cancellationToken);

        var email = await context.Users
            .Where(u => u.Id == order.UserId)
            .Select(u => u.Email)
            .FirstOrDefaultAsync(cancellationToken) ?? "(unknown)";

        return AdminOrderMapper.ToDto(order, email);
    }

    private async Task RestockAsync(Order order, CancellationToken cancellationToken)
    {
        var qtyBySlug = order.Items
            .Where(i => i.ProductSlug is not null)
            .GroupBy(i => i.ProductSlug!)
            .ToDictionary(g => g.Key, g => g.GroupBy(i => i.Variant).ToDictionary(v => v.Key, v => v.Sum(i => i.Qty)));

        if (qtyBySlug.Count == 0)
        {
            return;
        }

        var products = await context.Products
            .Include(p => p.Variants)
            .Where(p => qtyBySlug.Keys.Contains(p.Slug))
            .ToListAsync(cancellationToken);

        foreach (var product in products)
        {
            foreach (var (variantLabel, qty) in qtyBySlug[product.Slug])
            {
                var variant = product.Variants.FirstOrDefault(v => v.Label == variantLabel);
                if (variant is null)
                {
                    continue;
                }
                variant.StockQuantity += qty;
            }
            product.RecalculateInStock();
        }
    }
}
