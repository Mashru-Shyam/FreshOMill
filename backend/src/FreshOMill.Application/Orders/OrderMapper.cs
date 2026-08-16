using FreshOMill.Domain.Orders;

namespace FreshOMill.Application.Orders;

internal static class OrderMapper
{
    public static OrderDto ToDto(Order order) =>
        new(
            order.Id,
            order.PlacedAt,
            order.Status.ToString(),
            order.Total,
            order.PaymentMethod.ToString(),
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
