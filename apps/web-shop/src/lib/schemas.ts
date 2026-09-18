import { z } from "zod";

// Shared zod field builders so every feature schema pulls its max-length limits
// from one place instead of hand-rolling them per form.

export const nameField = (max = 100) =>
  z
    .string()
    .trim()
    .min(1, "This field is required.")
    .max(max, `Must be ${max} characters or fewer.`);

export const optionalNameField = (max = 100) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .optional()
    .or(z.literal(""));

export const emailField = (max = 256) =>
  z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required.")
    .max(max, `Must be ${max} characters or fewer.`)
    .email("Enter a valid email address.");

export const optionalEmailField = (max = 256) =>
  z
    .string()
    .trim()
    .toLowerCase()
    .max(max, `Must be ${max} characters or fewer.`)
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address.",
    })
    .optional()
    .or(z.literal(""));

export const phoneField = (max = 30) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .optional()
    .or(z.literal(""));

export const shortTextField = (max: number, label = "This field") =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `Must be ${max} characters or fewer.`);

export const optionalShortTextField = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .optional()
    .or(z.literal(""));

export const longTextField = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .optional()
    .or(z.literal(""));
