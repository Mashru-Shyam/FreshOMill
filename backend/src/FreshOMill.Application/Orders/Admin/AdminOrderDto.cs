using FreshOMill.Application.Orders;

namespace FreshOMill.Application.Orders.Admin;

/// <summary>Same shape as the customer-facing OrderDto plus the customer's email — the customer
/// endpoint never needs it (it's always "my own orders"), but the admin order list/detail is
/// across every customer, so it needs a way to tell whose order it's looking at.</summary>
public sealed record AdminOrderDto(
    Guid Id,
    DateTimeOffset PlacedAt,
    string Status,
    decimal Total,
    string PaymentMethod,
    string CustomerEmail,
    ShippingAddressDto ShippingAddress,
    IReadOnlyList<OrderItemDto> Items);
