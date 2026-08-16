using FreshOMill.Application.Common.Interfaces;
using MediatR;

namespace FreshOMill.Application.Common.Ping;

/// <summary>
/// Trivial query proving the MediatR + FluentValidation + logging pipeline works end-to-end.
/// Not a real feature — remove once real module queries exist to exercise the same plumbing.
/// </summary>
public sealed record PingQuery(string? Message) : IRequest<PingResponse>;

public sealed record PingResponse(string Message, DateTimeOffset ServerTimeUtc);

public sealed class PingQueryHandler(IDateTimeProvider dateTimeProvider) : IRequestHandler<PingQuery, PingResponse>
{
    public Task<PingResponse> Handle(PingQuery request, CancellationToken cancellationToken) =>
        Task.FromResult(new PingResponse(request.Message ?? "pong", dateTimeProvider.UtcNow));
}
