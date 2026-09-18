namespace ApiOos.Validators;

using ApiOos.DTOs.Requests.Users;
using FluentValidation;

public class AddressRequestValidator : AbstractValidator<AddressRequest>
{
    public AddressRequestValidator()
    {
        RuleFor(x => x.Label)
            .NotEmpty().WithMessage("Label is required")
            .MaximumLength(100).WithMessage("Label cannot exceed 100 characters")
            .Matches(ValidationPatterns.AddressText).WithMessage("Label contains characters that are not allowed");

        RuleFor(x => x.Street)
            .NotEmpty().WithMessage("Street is required")
            .MaximumLength(100).WithMessage("Street cannot exceed 100 characters")
            .Matches(ValidationPatterns.AddressText).WithMessage("Street contains characters that are not allowed");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required")
            .MaximumLength(100).WithMessage("City cannot exceed 100 characters")
            .Matches(ValidationPatterns.AddressText).WithMessage("City contains characters that are not allowed");

        RuleFor(x => x.Province)
            .NotEmpty().WithMessage("Province is required")
            .MaximumLength(100).WithMessage("Province cannot exceed 100 characters")
            .Matches(ValidationPatterns.AddressText).WithMessage("Province contains characters that are not allowed");

        RuleFor(x => x.PostalCode)
            .NotEmpty().WithMessage("Postal code is required")
            .MaximumLength(100).WithMessage("Postal code cannot exceed 100 characters")
            .Matches(ValidationPatterns.PostalCode).WithMessage("Postal code contains characters that are not allowed");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required")
            .MaximumLength(100).WithMessage("Country cannot exceed 100 characters")
            .Matches(ValidationPatterns.AddressText).WithMessage("Country contains characters that are not allowed");
    }
}
