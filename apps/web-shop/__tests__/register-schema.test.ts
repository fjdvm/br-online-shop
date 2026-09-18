import { registerSchema } from "@/lib/validators/auth";

const validBase = {
  fullName: "Jane Doe",
  email: "jane@example.com",
  password: "Password1",
  confirmPassword: "Password1",
  terms: true,
};

describe("registerSchema marketingOptIn", () => {
  it("rejects signup when the marketing question is left unanswered", () => {
    const result = registerSchema.safeParse(validBase);
    expect(result.success).toBe(false);
  });

  it("accepts an explicit yes", () => {
    const result = registerSchema.safeParse({ ...validBase, marketingOptIn: "yes" });
    expect(result.success).toBe(true);
  });

  it("accepts an explicit no", () => {
    const result = registerSchema.safeParse({ ...validBase, marketingOptIn: "no" });
    expect(result.success).toBe(true);
  });

  it("rejects any value other than yes or no", () => {
    const result = registerSchema.safeParse({ ...validBase, marketingOptIn: "maybe" });
    expect(result.success).toBe(false);
  });
});
