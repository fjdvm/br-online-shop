namespace ApiOos.Validators;

using ApiOos.DTOs.Requests.Users;
using FluentValidation;

public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required")
            .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters")
            .Matches(ValidationPatterns.PersonName).WithMessage("Full name can only contain letters, spaces, hyphens, and apostrophes");

        RuleFor(x => x.PhoneNumber)
            .Matches(ValidationPatterns.PhMobilePhone).WithMessage("Enter a valid PH mobile number, e.g. 09171234567")
            .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber));
    }
}
