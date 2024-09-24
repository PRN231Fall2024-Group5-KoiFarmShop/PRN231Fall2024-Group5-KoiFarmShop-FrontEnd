import { z } from "zod";

// Define the basic User type
export type User = {
  id: string;
  fullName: string;
  unsignFullName: string;
  email: string;
  phoneNumber: string;
  dob: string; // Assuming date of birth is stored as a string in ISO format
  profilePictureUrl: string;
  address: string;
  isActive: boolean;
  loyaltyPoints: number;
  isDeleted: boolean;
  role: "admin" | "manager" | "staff" | "customer"; // Assuming roles are fixed
  createdAt: Date;
  updatedAt: Date;
};

// Create User DTO validation schema using Zod
export const createUserSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  dob: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date of birth" }),
  profilePictureUrl: z.string().url("Invalid URL"),
  address: z.string().min(1, "Address is required"),
  role: z.enum(["manager", "staff", "customer"]),
});

// Create User DTO interface
export interface CreateUserDTO {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  dob: string; // ISO string
  profilePictureUrl: string;
  address: string;
  role: "manager" | "staff" | "customer";
}

// Update User DTO validation schema using Zod
export const updateUserSchema = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  unsignFullName: z.string().min(1, "Unsign full name is required").optional(),
  email: z.string().email("Invalid email").optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters").optional(),
  dob: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date of birth" })
    .optional(),
  profilePictureUrl: z.string().url("Invalid URL").optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
  loyaltyPoints: z.number().nonnegative().optional(),
  isDeleted: z.boolean().optional(),
  role: z.enum(["admin", "manager", "staff"]).optional(),
});

// Update User DTO interface
export interface UpdateUserDTO {
  fullName?: string;
  unsignFullName?: string;
  email?: string;
  phoneNumber?: string;
  dob?: string; // ISO string
  profilePictureUrl?: string;
  address?: string;
  isActive?: boolean;
  loyaltyPoints?: number;
  isDeleted?: boolean;
  role?: "admin" | "manager" | "staff";
}
