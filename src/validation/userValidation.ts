import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must contain atleast 3 characters"),

    email: z
      .string()
      .trim()
      .email("Invalid email format"),

    phoneNumber: z
      .string()
      .trim()
      .regex(
        /^[6-9]\d{9}$/,
        "Phone number must be a valid 10-digit  number"
      ),

    password: z
      .string()
      .min(6, "Password must contain atleast 6 characters")
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,
        "Password must contain uppercase, lowercase and number"
      ),

  //   confirmPassword: z
  //     .string()
  //     .min(1, "Confirm password is required"),
  // })

  // .refine((data) => data.password === data.confirmPassword, {
  //   message: "Passwords do not match",
  //   path: ["confirmPassword"],
  });