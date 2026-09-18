import { z } from "zod";
import { AddressLabel } from "@/types/auth";

export const EMAIL_MAX = 256;
export const NAME_MAX = 100;
export const PASSWORD_MAX = 128;
export const PHONE_MAX = 30;
export const LANGUAGE_MAX = 50;

export const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
export const PH_MOBILE_REGEX = /^(\+63|0)9\d{9}$/;
export const ADDRESS_REGEX = /^[a-zA-Z0-9\s,.#\-/'&]+$/;
export const POSTAL_CODE_REGEX = /^[a-zA-Z0-9\s-]+$/;

const NAME_INVALID_MESSAGE = "Can only contain letters, spaces, hyphens, and apostrophes";
const PHONE_INVALID_MESSAGE = "Enter a valid PH mobile number, e.g. 09171234567";
const ADDRESS_INVALID_MESSAGE = "Contains characters that are not allowed";

export const loginSchema = z.object({
  email: z.string().trim().max(EMAIL_MAX, `Must be ${EMAIL_MAX} characters or fewer`).email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").max(PASSWORD_MAX, `Must be ${PASSWORD_MAX} characters or fewer`),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(PASSWORD_MAX, `Must be ${PASSWORD_MAX} characters or fewer`)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required").max(NAME_MAX, `Must be ${NAME_MAX} characters or fewer`).regex(NAME_REGEX, NAME_INVALID_MESSAGE),
    email: z.string().trim().max(EMAIL_MAX, `Must be ${EMAIL_MAX} characters or fewer`).email("Enter a valid email address"),
    password: strongPassword,
    confirmPassword: z.string().max(PASSWORD_MAX, `Must be ${PASSWORD_MAX} characters or fewer`),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service",
    }),
    // No boolean default here on purpose: a plain boolean silently defaults to
    // false (opted out) if the shopper never engages with the field. The enum
    // has no valid "unanswered" value, so the form genuinely forces a choice.
    marketingOptIn: z.enum(["yes", "no"], {
      message: "Please let us know if you'd like to receive marketing emails",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().max(EMAIL_MAX, `Must be ${EMAIL_MAX} characters or fewer`).email("Enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().max(PASSWORD_MAX, `Must be ${PASSWORD_MAX} characters or fewer`),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(NAME_MAX, `Must be ${NAME_MAX} characters or fewer`).regex(NAME_REGEX, NAME_INVALID_MESSAGE),
  email: z.string().trim().max(EMAIL_MAX, `Must be ${EMAIL_MAX} characters or fewer`).email().optional(),
  phoneNumber: z
    .string()
    .trim()
    .max(PHONE_MAX, `Must be ${PHONE_MAX} characters or fewer`)
    .refine((value) => value === "" || PH_MOBILE_REGEX.test(value), PHONE_INVALID_MESSAGE)
    .optional(),
  preferredLanguage: z.string().trim().max(LANGUAGE_MAX, `Must be ${LANGUAGE_MAX} characters or fewer`).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const ADDRESS_FIELD_MAX = 100;

export const addressSchema = z.object({
  label: z.enum(AddressLabel, {
    message: "Please select a label",
  }),
  street: z.string().trim().min(1, "Street address is required").max(ADDRESS_FIELD_MAX, `Must be ${ADDRESS_FIELD_MAX} characters or fewer`).regex(ADDRESS_REGEX, ADDRESS_INVALID_MESSAGE),
  city: z.string().trim().min(1, "City is required").max(ADDRESS_FIELD_MAX, `Must be ${ADDRESS_FIELD_MAX} characters or fewer`).regex(ADDRESS_REGEX, ADDRESS_INVALID_MESSAGE),
  province: z.string().trim().min(1, "Province / State is required").max(ADDRESS_FIELD_MAX, `Must be ${ADDRESS_FIELD_MAX} characters or fewer`).regex(ADDRESS_REGEX, ADDRESS_INVALID_MESSAGE),
  postalCode: z.string().trim().min(1, "Postal code is required").max(ADDRESS_FIELD_MAX, `Must be ${ADDRESS_FIELD_MAX} characters or fewer`).regex(POSTAL_CODE_REGEX, ADDRESS_INVALID_MESSAGE),
  country: z.string().trim().min(1, "Country is required").max(ADDRESS_FIELD_MAX, `Must be ${ADDRESS_FIELD_MAX} characters or fewer`).regex(ADDRESS_REGEX, ADDRESS_INVALID_MESSAGE),
  isDefault: z.boolean(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
