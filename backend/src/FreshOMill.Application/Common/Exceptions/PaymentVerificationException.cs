namespace FreshOMill.Application.Common.Exceptions;

/// <summary>Thrown when a client-submitted payment confirmation fails gateway signature
/// verification — either a genuinely failed payment or a tampered request. Maps to 400 Bad
/// Request in GlobalExceptionHandler.</summary>
public sealed class PaymentVerificationException(string message) : Exception(message);
