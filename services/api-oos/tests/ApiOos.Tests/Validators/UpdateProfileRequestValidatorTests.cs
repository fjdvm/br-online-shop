namespace ApiOos.Tests.Validators;

using ApiOos.DTOs.Requests.Users;
using ApiOos.Validators;
using FluentAssertions;
using FluentValidation.TestHelper;
using Xunit;

public class UpdateProfileRequestValidatorTests
{
    private readonly UpdateProfileRequestValidator _validator = new();

    [Theory]
    [InlineData("09171234567")]
    [InlineData("+639171234567")]
    public void Valid_ph_mobile_number_passes(string phone)
    {
        var request = new UpdateProfileRequest("Juan Dela Cruz", phone, "en");

        var result = _validator.TestValidate(request);

        result.ShouldNotHaveValidationErrorFor(x => x.PhoneNumber);
    }

    [Fact]
    public void Null_phone_number_passes()
    {
        var request = new UpdateProfileRequest("Juan Dela Cruz", null, "en");

        var result = _validator.TestValidate(request);

        result.ShouldNotHaveValidationErrorFor(x => x.PhoneNumber);
    }

    [Theory]
    [InlineData("call-me-maybe")]
    [InlineData("123")]
    [InlineData("081234567890")]
    public void Invalid_phone_number_is_rejected(string phone)
    {
        var request = new UpdateProfileRequest("Juan Dela Cruz", phone, "en");

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.PhoneNumber);
    }

    [Fact]
    public void Full_name_with_digits_is_rejected()
    {
        var request = new UpdateProfileRequest("Juan123", null, "en");

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.FullName);
    }

    [Fact]
    public void Full_name_with_apostrophe_and_hyphen_passes()
    {
        var request = new UpdateProfileRequest("Mary O'Brien-Santos", null, "en");

        var result = _validator.TestValidate(request);

        result.ShouldNotHaveValidationErrorFor(x => x.FullName);
    }
}
