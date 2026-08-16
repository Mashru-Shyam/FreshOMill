namespace FreshOMill.Application.Contact;

/// <summary>Not a secret (just a mailbox address) — lives entirely in appsettings.json, no
/// user-secrets needed, unlike EmailOptions/RazorpayOptions.</summary>
public sealed class ContactOptions
{
    public const string SectionName = "Contact";

    public required string NotifyEmail { get; init; }
}
