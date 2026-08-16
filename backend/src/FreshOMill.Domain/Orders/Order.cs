using FreshOMill.Domain.Common;

namespace FreshOMill.Domain.Orders;

/// <summary>
/// Shipping address is flat columns here, never a FK to Addresses — it must stay immutable even
/// if the address book entry is later edited or deleted, same snapshot behavior
/// orders.service.ts's placeOrder() already has on the frontend.
/// </summary>
public sealed class Order : BaseAuditableEntity<Guid>
{
    // See Identity/User.cs for why this self-assigns Id.
    public Order() => Id = Guid.NewGuid();

    public Guid UserId { get; set; }

    public DateTimeOffset PlacedAt { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Placed;

    public decimal Total { get; set; }

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cod;

    /// <summary>Set once an online-payment order's gateway order is created; null for COD.</summary>
    public string? GatewayOrderId { get; set; }

    /// <summary>Set once the gateway confirms a successful payment (via client verify or webhook).</summary>
    public string? GatewayPaymentId { get; set; }

    public DateTimeOffset? PaidAt { get; set; }

    public required string ShippingFullName { get; set; }

    public required string ShippingPhone { get; set; }

    public required string ShippingAddressLine1 { get; set; }

    public string? ShippingAddressLine2 { get; set; }

    public required string ShippingCity { get; set; }

    public required string ShippingState { get; set; }

    public required string ShippingPincode { get; set; }

    public List<OrderItem> Items { get; set; } = [];
}
