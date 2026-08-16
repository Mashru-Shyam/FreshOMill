namespace FreshOMill.Domain.Orders;

/// <summary>
/// Only two choices — Razorpay's own Checkout widget is what actually lets the shopper pick
/// UPI/Card/Netbanking, so this app never tracks which one they used within that, just whether
/// the order was paid online through Razorpay or collected as cash.
/// </summary>
public enum PaymentMethod
{
    Cod,
    Online,
}
