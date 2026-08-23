using FreshOMill.Application.Orders;
using FreshOMill.Domain.Orders;

namespace FreshOMill.Application.Orders.Admin;

internal static class AdminOrderMapper
{
    public static AdminOrderDto ToDto(Order order, string customerEmail) =>
        new(
            order.Id,
            order.PlacedAt,
            order.Status.ToString(),
            order.Total,
            order.PaymentMethod.ToString(),
            customerEmail,
            new ShippingAddressDto(
                order.ShippingFullName,
                order.ShippingPhone,
                order.ShippingAddressLine1,
                order.ShippingAddressLine2,
                order.ShippingCity,
                order.ShippingState,
                order.ShippingPincode),
            order.Items
                .Select(i => new OrderItemDto(i.ProductSlug, i.Name, i.ImageUrl, i.Variant, i.UnitPrice, i.Qty))
                .ToList());
}
