namespace FreshOMill.Application.Identity;

/// <summary>Email allow-list checked on every OTP verification (see VerifyOtpCommandHandler) — an
/// email in this list is granted the "Admin" role on login, even retroactively if added after the
/// account already existed. Not a secret, lives in appsettings.json like ContactOptions.
/// A one-role MVP: there's no in-app way to promote a second admin yet, since only one operator
/// exists at this stage — see the Admin Panel plan's Phase 3 for Owner/Staff tiers.</summary>
public sealed class AdminOptions
{
    public const string SectionName = "Admin";

    public string[] Emails { get; init; } = [];
}
