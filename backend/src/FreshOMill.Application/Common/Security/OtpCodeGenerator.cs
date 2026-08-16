using System.Globalization;
using System.Security.Cryptography;

namespace FreshOMill.Application.Common.Security;

public static class OtpCodeGenerator
{
    /// <summary>Cryptographically random 6-digit code (000000–999999, zero-padded).</summary>
    public static string Generate() =>
        RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6", CultureInfo.InvariantCulture);
}
