namespace FreshOMill.Application.Common.Exceptions;

/// <summary>Thrown when a requested/referenced resource doesn't exist (or doesn't belong to the
/// current user — scoped lookups return this rather than a distinguishable 403, so an attacker
/// can't use the status code to tell "not yours" from "doesn't exist"). Maps to 404 in GlobalExceptionHandler.</summary>
public sealed class NotFoundException(string message) : Exception(message);
