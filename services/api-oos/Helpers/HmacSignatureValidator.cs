namespace ApiOos.Helpers;

using System.Security.Cryptography;
using System.Text;

public static class HmacSignatureValidator
{
    public static bool IsValid(byte[] payload, string? signatureHeader, string secret)
    {
        const string prefix = "sha256=";
        if (string.IsNullOrWhiteSpace(signatureHeader) ||
            !signatureHeader.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        byte[] supplied;
        try
        {
            supplied = Convert.FromHexString(signatureHeader[prefix.Length..]);
        }
        catch (FormatException)
        {
            return false;
        }

        var expected = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), payload);
        return supplied.Length == expected.Length &&
               CryptographicOperations.FixedTimeEquals(supplied, expected);
    }
}
