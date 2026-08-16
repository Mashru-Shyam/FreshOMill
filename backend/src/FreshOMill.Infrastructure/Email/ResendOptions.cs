namespace FreshOMill.Infrastructure.Email;

public sealed class ResendOptions
{
    public const string SectionName = "Resend";

    /// <summary>API key from the Resend dashboard. Local dev: user-secrets. Prod: env var/secret store — never appsettings.json.</summary>
    public required string ApiKey { get; init; }
}
