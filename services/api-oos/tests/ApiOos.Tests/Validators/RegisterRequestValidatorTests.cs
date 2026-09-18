namespace ApiOos.Tests.Validators;

using ApiOos.DTOs.Requests.Auth;
using ApiOos.Validators;
using FluentValidation.TestHelper;
using Xunit;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _validator = new();

    [Fact]
    public void Full_name_with_digits_is_rejected()
    {
        var request = new RegisterRequest("Juan123", "juan@example.com", "Password1", false);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.FullName);
    }

    [Fact]
    public void Full_name_with_letters_spaces_and_hyphen_passes()
    {
        var request = new RegisterRequest("Juan Dela Cruz-Santos", "juan@example.com", "Password1", false);

        var result = _validator.TestValidate(request);

        result.ShouldNotHaveValidationErrorFor(x => x.FullName);
    }
}
