namespace FreshOMill.Domain.Common;

public interface IDomainEvent
{
    DateTimeOffset OccurredOn { get; }
}
