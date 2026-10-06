import z from "zod";

export const createDriverApplicationSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters"),
	email: z.email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters long"),
	phone: z
		.string("Phone number is required")
		.length(11, "Phone number must be exactly 11 digits")
		.regex(/^01[3-9]\d{8}$/, "Invalid phone number"),

	licenseNumber: z.string().min(1, "License number is required"),
	licenseExpiry: z.coerce.date().optional(),
});

export const driverApplicationParamsSchema = z.object({
	id: z.uuid("Invalid driver application id"),
});
