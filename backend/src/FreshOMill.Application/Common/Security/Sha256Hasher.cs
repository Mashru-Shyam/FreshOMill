using System.Security.Cryptography;
using System.Text;

namespace FreshOMill.Application.Common.Security;

/// <summary>
/// Hashes OTP codes and refresh tokens before storing them. SHA-256 (not a slow password KDF like
/// bcrypt/argon2) is intentional here — these are high-entropy, short-lived, server-generated
/// random values, not user-chosen secrets, so KDF-style brute-force resistance isn't the threat
/// model; the point is just "don't store the plaintext token in the database". Pure BCL crypto,
/// no external dependency, so this lives directly in Application rather than behind an interface.
/// </summary>
public static class Sha256Hasher
{
    public static string Hash(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes);
    }
}
