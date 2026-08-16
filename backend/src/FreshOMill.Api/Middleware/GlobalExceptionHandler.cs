using FluentValidation;
using FreshOMill.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FreshOMill.Api.Middleware;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment environment)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title, detail, extensions) = MapException(exception);

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Unhandled exception");
        }
        else
        {
            logger.LogWarning(exception, "Request failed with {StatusCode}: {Title}", statusCode, title);
        }

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail ?? (environment.IsDevelopment() ? exception.Message : null),
            Instance = httpContext.Request.Path,
        };

        foreach (var (key, value) in extensions)
        {
            problemDetails.Extensions[key] = value;
        }

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }

    private static (int StatusCode, string Title, string? Detail, IReadOnlyDictionary<string, object?> Extensions) MapException(
        Exception exception) =>
        exception switch
        {
            ValidationException validationException => (
                StatusCodes.Status400BadRequest,
                "Validation failed",
                null,
                new Dictionary<string, object?>
                {
                    ["errors"] = validationException.Errors
                        .GroupBy(e => e.PropertyName)
                        .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray()),
                }),
            AuthenticationException authenticationException => (
                StatusCodes.Status401Unauthorized,
                "Authentication failed",
                authenticationException.Message,
                new Dictionary<string, object?>()),
            NotFoundException notFoundException => (
                StatusCodes.Status404NotFound,
                "Not found",
                notFoundException.Message,
                new Dictionary<string, object?>()),
            InsufficientStockException insufficientStockException => (
                StatusCodes.Status409Conflict,
                "Insufficient stock",
                insufficientStockException.Message,
                new Dictionary<string, object?>()),
            PaymentVerificationException paymentVerificationException => (
                StatusCodes.Status400BadRequest,
                "Payment verification failed",
                paymentVerificationException.Message,
                new Dictionary<string, object?>()),
            DbUpdateConcurrencyException => (
                StatusCodes.Status409Conflict,
                "Conflict",
                "That item just changed — please try again.",
                new Dictionary<string, object?>()),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred", null, new Dictionary<string, object?>()),
        };
}
