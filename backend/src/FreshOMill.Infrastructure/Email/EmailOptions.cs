namespace FreshOMill.Infrastructure.Email;

public sealed class EmailOptions
{
    public const string SectionName = "Email";

    public required string FromAddress { get; init; }

    public required string FromName { get; init; }
}
