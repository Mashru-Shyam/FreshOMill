using FluentValidation;

namespace FreshOMill.Application.Common.Ping;

public sealed class PingQueryValidator : AbstractValidator<PingQuery>
{
    public PingQueryValidator()
    {
        RuleFor(x => x.Message)
            .MaximumLength(200)
            .When(x => x.Message is not null);
    }
}
