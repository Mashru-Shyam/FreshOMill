using FreshOMill.Application.Common.Interfaces;

namespace FreshOMill.Infrastructure.Services;

public sealed class DateTimeProvider : IDateTimeProvider
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
