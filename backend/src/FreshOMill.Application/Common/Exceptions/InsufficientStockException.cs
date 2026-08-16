namespace FreshOMill.Application.Common.Exceptions;

/// <summary>Thrown when an order requests more of a product variant than is currently in stock.
/// Maps to 409 Conflict in GlobalExceptionHandler — the message is safe to show the shopper
/// directly (e.g. "Only 2 left of Coconut Oil (500ml)").</summary>
public sealed class InsufficientStockException(string message) : Exception(message);
