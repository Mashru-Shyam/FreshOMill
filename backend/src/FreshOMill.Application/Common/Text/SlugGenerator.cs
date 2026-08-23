using System.Text;
using System.Text.RegularExpressions;

namespace FreshOMill.Application.Common.Text;

/// <summary>Turns a display name into a URL-safe slug ("Ghee & Dairy" → "ghee-dairy") — used by
/// the admin Category/Product create commands so an operator never has to think about slugs.
/// Uniqueness against existing rows is still the caller's job (see CreateCategoryCommand).</summary>
public static partial class SlugGenerator
{
    public static string FromName(string name)
    {
        var lower = name.Trim().ToLowerInvariant();
        var withoutDiacritics = RemoveDiacritics(lower);
        var slug = NonAlphanumeric().Replace(withoutDiacritics, "-");
        slug = MultipleHyphens().Replace(slug, "-").Trim('-');
        return slug;
    }

    private static string RemoveDiacritics(string text)
    {
        var normalized = text.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder();
        foreach (var c in normalized)
        {
            if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
            {
                builder.Append(c);
            }
        }
        return builder.ToString().Normalize(NormalizationForm.FormC);
    }

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex NonAlphanumeric();

    [GeneratedRegex("-+")]
    private static partial Regex MultipleHyphens();
}
