namespace FreshOMill.Application.Common.Exceptions;

/// <summary>Thrown for admin mutations that would violate a business rule rather than stock
/// (e.g. deleting a category that still has products, or a slug collision). Maps to 409 Conflict
/// in GlobalExceptionHandler — the message is safe to show the admin directly.</summary>
public sealed class ConflictException(string message) : Exception(message);
