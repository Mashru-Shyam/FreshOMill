namespace FreshOMill.Domain.Orders;

public enum OrderStatus
{
    /// <summary>Order row + stock decrement exist, but an online payment hasn't been confirmed
    /// yet (Cash on Delivery orders skip this state entirely and start at <see cref="Placed"/>).</summary>
    PendingPayment,
    Placed,
    Shipped,
    Delivered,
    Cancelled,
    /// <summary>The gateway reported the payment failed (or its signature couldn't be verified).
    /// Stock decremented at order creation is restored when this is set.</summary>
    PaymentFailed,
}
