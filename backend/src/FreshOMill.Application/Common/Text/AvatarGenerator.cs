namespace FreshOMill.Application.Common.Text;

/// <summary>Derives a letter-avatar (initial + gradient) from a display name, so the admin
/// Customer Stories form only has to collect the name/text/video — not raw CSS gradients.</summary>
internal static class AvatarGenerator
{
    private static readonly string[] Gradients =
    [
        "linear-gradient(135deg, var(--color-brand-brown), var(--color-secondary))",
        "linear-gradient(135deg, var(--color-secondary), var(--color-primary))",
        "linear-gradient(135deg, var(--color-brand-green), var(--color-primary))",
        "linear-gradient(135deg, var(--color-primary), var(--color-brand-brown))",
        "linear-gradient(135deg, var(--color-brand-green), var(--color-secondary))",
    ];

    public static string InitialFromName(string name)
    {
        var trimmed = name.Trim();
        return trimmed.Length > 0 ? trimmed[..1].ToUpperInvariant() : "?";
    }

    public static string GradientFromName(string name)
    {
        uint hash = 0;
        foreach (var ch in name)
        {
            unchecked
            {
                hash = hash * 31 + ch;
            }
        }
        return Gradients[hash % (uint)Gradients.Length];
    }
}
