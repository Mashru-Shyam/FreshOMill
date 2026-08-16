namespace FreshOMill.Application.Orders;

public sealed record OrderItemDto(string? ProductSlug, string Name, string? ImageUrl, string Variant, decimal UnitPrice, int Qty);

public sealed record ShippingAddressDto(
    string FullName,
    string Phone,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string Pincode);

/// <summary>Only present on a freshly-placed online-payment order (Status "PendingPayment") —
/// everything the frontend needs to open the Razorpay Checkout widget. AmountInSmallestUnit is
/// paise (INR), matching what Razorpay's widget expects.</summary>
public sealed record PaymentGatewayInfoDto(string KeyId, string GatewayOrderId, string Currency, long AmountInSmallestUnit);

public sealed record OrderDto(
    Guid Id,
    DateTimeOffset PlacedAt,
    string Status,
    decimal Total,
    string PaymentMethod,
    ShippingAddressDto ShippingAddress,
    IReadOnlyList<OrderItemDto> Items,
    PaymentGatewayInfoDto? PaymentGateway = null);
