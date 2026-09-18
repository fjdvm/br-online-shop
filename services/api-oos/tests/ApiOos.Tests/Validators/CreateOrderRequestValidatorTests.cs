namespace ApiOos.Tests.Validators;

using ApiOos.DTOs.Requests.Orders;
using ApiOos.Enums;
using ApiOos.Validators;
using FluentAssertions;
using FluentValidation.TestHelper;
using Xunit;

public class CreateOrderRequestValidatorTests
{
    private readonly CreateOrderRequestValidator _validator = new();

    private static ShippingAddressRequest ValidShippingAddress() => new()
    {
        RecipientName = "Juan Dela Cruz",
        Street = "123 Katipunan Ave",
        City = "Quezon City",
        Province = "Metro Manila",
        PostalCode = "1108",
        Phone = "09171234567",
    };

    [Fact]
    public void Valid_order_passes()
    {
        var request = new CreateOrderRequest { ShippingAddress = ValidShippingAddress(), PaymentMethod = PaymentMethod.CashOnDelivery };

        var result = _validator.TestValidate(request);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Script_tag_in_shipping_street_is_rejected()
    {
        var address = ValidShippingAddress();
        address.Street = "<script>alert(1)</script>";
        var request = new CreateOrderRequest { ShippingAddress = address, PaymentMethod = PaymentMethod.CashOnDelivery };

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor("ShippingAddress.Street");
    }

    [Fact]
    public void Non_ph_mobile_phone_is_rejected()
    {
        var address = ValidShippingAddress();
        address.Phone = "12345";
        var request = new CreateOrderRequest { ShippingAddress = address, PaymentMethod = PaymentMethod.CashOnDelivery };

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor("ShippingAddress.Phone");
    }

    [Fact]
    public void Recipient_name_with_digits_is_rejected()
    {
        var address = ValidShippingAddress();
        address.RecipientName = "Juan123";
        var request = new CreateOrderRequest { ShippingAddress = address, PaymentMethod = PaymentMethod.CashOnDelivery };

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor("ShippingAddress.RecipientName");
    }
}
