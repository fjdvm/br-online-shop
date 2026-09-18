namespace ApiOos.Validators;

using ApiOos.DTOs.Requests.Orders;
using FluentValidation;

public class ShippingAddressRequestValidator : AbstractValidator<ShippingAddressRequest>
{
    public ShippingAddressRequestValidator()
    {
        RuleFor(x => x.RecipientName)
            .NotEmpty().WithMessage("Recipient name is required")
            .MaximumLength(100).WithMessage("Recipient name cannot exceed 100 characters")
            .Matches(ValidationPatterns.PersonName).WithMessage("Recipient name can only contain letters, spaces, hyphens, and apostrophes");

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

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required")
            .Matches(ValidationPatterns.PhMobilePhone).WithMessage("Enter a valid PH mobile number, e.g. 09171234567");
    }
}

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.ShippingAddress)
            .NotNull().WithMessage("Shipping address is required")
            .SetValidator(new ShippingAddressRequestValidator());
    }
}
