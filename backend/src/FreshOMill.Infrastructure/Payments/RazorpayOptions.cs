namespace FreshOMill.Infrastructure.Payments;

public sealed class RazorpayOptions
{
    public const string SectionName = "Razorpay";

    /// <summary>Public key id — safe in appsettings.json, also handed to the frontend to open the checkout widget.</summary>
    public required string KeyId { get; init; }

    /// <summary>Secret used to sign gateway API calls and verify payment signatures. Local dev: user-secrets. Prod: env var/secret store — never appsettings.json.</summary>
    public required string KeySecret { get; init; }

    /// <summary>Separate secret configured in the Razorpay dashboard's webhook settings — used only to verify inbound webhook calls, never sent to Razorpay.</summary>
    public required string WebhookSecret { get; init; }
}
