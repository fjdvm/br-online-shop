namespace ApiOos.Tests.Validators;

using ApiOos.DTOs.Requests.Users;
using ApiOos.Validators;
using FluentAssertions;
using FluentValidation.TestHelper;
using Xunit;

public class AddressRequestValidatorTests
{
    private readonly AddressRequestValidator _validator = new();

    [Fact]
    public void Valid_address_passes()
    {
        var request = new AddressRequest("Home", "123 Katipunan Ave, Unit #4", "Quezon City", "Metro Manila", "1108", "Philippines");

        var result = _validator.TestValidate(request);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Street_with_script_tag_is_rejected()
    {
        var request = new AddressRequest("Home", "<script>alert(1)</script>", "Quezon City", "Metro Manila", "1108", "Philippines");

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.Street);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Empty_city_is_rejected(string city)
    {
        var request = new AddressRequest("Home", "123 Katipunan Ave", city, "Metro Manila", "1108", "Philippines");

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.City);
    }
}
