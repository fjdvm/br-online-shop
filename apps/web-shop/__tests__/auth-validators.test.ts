import { registerSchema, profileSchema, addressSchema } from "@/lib/validators/auth";

const validRegister = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  password: "Password1",
  confirmPassword: "Password1",
  terms: true,
  marketingOptIn: "yes" as const,
};

describe("registerSchema fullName", () => {
  it("rejects a name containing digits", () => {
    const result = registerSchema.safeParse({ ...validRegister, fullName: "Jane2" });
    expect(result.success).toBe(false);
  });

  it("rejects a name containing an HTML tag", () => {
    const result = registerSchema.safeParse({ ...validRegister, fullName: "<script>alert(1)</script>" });
    expect(result.success).toBe(false);
  });

  it("accepts a name with a hyphen and apostrophe", () => {
    const result = registerSchema.safeParse({ ...validRegister, fullName: "Mary O'Brien-Santos" });
    expect(result.success).toBe(true);
  });
});

describe("profileSchema phoneNumber", () => {
  const validProfile = { fullName: "Jane Doe" };

  it("accepts a PH mobile number in 09XXXXXXXXX format", () => {
    const result = profileSchema.safeParse({ ...validProfile, phoneNumber: "09171234567" });
    expect(result.success).toBe(true);
  });

  it("accepts a PH mobile number in +639XXXXXXXXX format", () => {
    const result = profileSchema.safeParse({ ...validProfile, phoneNumber: "+639171234567" });
    expect(result.success).toBe(true);
  });

  it("accepts an empty phone number", () => {
    const result = profileSchema.safeParse({ ...validProfile, phoneNumber: "" });
    expect(result.success).toBe(true);
  });

  it("rejects a phone number containing letters", () => {
    const result = profileSchema.safeParse({ ...validProfile, phoneNumber: "call-me-maybe" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-PH-format phone number", () => {
    const result = profileSchema.safeParse({ ...validProfile, phoneNumber: "12345" });
    expect(result.success).toBe(false);
  });
});

describe("addressSchema", () => {
  const validAddress = {
    label: "Home",
    street: "123 Katipunan Ave, Unit #4",
    city: "Quezon City",
    province: "Metro Manila",
    postalCode: "1108",
    country: "Philippines",
    isDefault: false,
  };

  it("accepts a valid address", () => {
    const result = addressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it("rejects a street containing a script tag", () => {
    const result = addressSchema.safeParse({ ...validAddress, street: "<script>alert(1)</script>" });
    expect(result.success).toBe(false);
  });

  it("rejects a city containing curly braces", () => {
    const result = addressSchema.safeParse({ ...validAddress, city: "Quezon{City}" });
    expect(result.success).toBe(false);
  });
});
