// Input-side normalization applied at submit-time. Never call these on every
// keystroke - only right before building the request payload - so the cursor
// position isn't disturbed.

export function trimField(value: string): string {
  return value.trim();
}

export function normalizeEmailInput(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhoneInput(value: string): string {
  return value.trim().replace(/\D/g, "");
}
