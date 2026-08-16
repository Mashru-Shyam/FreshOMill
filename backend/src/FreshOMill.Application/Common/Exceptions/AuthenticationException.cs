namespace FreshOMill.Application.Common.Exceptions;

/// <summary>Thrown for OTP/refresh-token verification failures — maps to 401 in GlobalExceptionHandler.</summary>
public sealed class AuthenticationException(string message) : Exception(message);
