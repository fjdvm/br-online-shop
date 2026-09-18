namespace ApiOos.Validators;

public static class ValidationPatterns
{
    public const string PersonName = @"^[a-zA-Z\s'-]+$";
    public const string PhMobilePhone = @"^(\+63|0)9\d{9}$";
    public const string AddressText = @"^[a-zA-Z0-9\s,.#\-/'&]+$";
    public const string PostalCode = @"^[a-zA-Z0-9\s-]+$";
}
