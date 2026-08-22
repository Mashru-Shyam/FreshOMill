namespace FreshOMill.Application.Common.Exceptions;

/// <summary>Thrown when the configured email provider rejects or fails to send a message (e.g.
/// Resend's sandbox restriction — without a verified sending domain, it only delivers to the
/// account's own signup address). Maps to 502 in GlobalExceptionHandler with a message safe to
/// show the caller directly.</summary>
public sealed class EmailDeliveryException(string message) : Exception(message);
