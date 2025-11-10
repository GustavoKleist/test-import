import z from "zod";

export const UserSchema = z
  .object({
    id: z
      .string()
      .min(1, "User ID cannot be empty")
      .describe("Unique identifier for the user"),
    email: z.email("Invalid email address").describe("User email address"),
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .describe("Full name of the user"),
    role: z
      .enum(["admin", "author", "reader", "manager"])
      .default("reader")
      .describe("Role of the user within the system"),
    active: z
      .boolean()
      .default(true)
      .describe("Indicates whether the user account is active"),
    created_at: z
      .date()
      .default(() => new Date())
      .describe("Timestamp when the user was created"),
    updated_at: z
      .date()
      .default(() => new Date())
      .describe("Timestamp when the user was last updated"),
  })
  .refine((data) => data.name.trim().length > 0, {
    message: "Name cannot be just whitespace",
    path: ["name"],
  });

export type User = z.infer<typeof UserSchema>;
