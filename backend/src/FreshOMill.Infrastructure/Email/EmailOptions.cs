namespace FreshOMill.Infrastructure.Email;

public sealed class EmailOptions
{
    public const string SectionName = "Email";

    public required string Host { get; init; }

    public required int Port { get; init; }

    public bool EnableSsl { get; init; } = true;

    /// <summary>SMTP auth credentials. Local dev: user-secrets. Prod: env var/secret store — never appsettings.json.</summary>
    public string? Username { get; init; }

    public string? Password { get; init; }

    public required string FromAddress { get; init; }

    public required string FromName { get; init; }
}
