import z, { email, string } from "zod";

export const registerUserSchema = z.object({
	name: z.string().min(3),
	email: z.email(),
	password: z.string().min(6, "Password must be at least 6 characters long"),
	// .regex(/[a-z]/, "Password must contain at least one lowercase letter")
	// .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	// .regex( /[^A-Za-z0-9]/, "Password must contain at least one special character" ),
});
export const loginUserSchema = z.object({
	email: z.email(),
	password: z.string().min(6, "Password must be at least 6 characters long"),
	// .regex(/[a-z]/, "Password must contain at least one lowercase letter")
	// .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	// .regex( /[^A-Za-z0-9]/, "Password must contain at least one special character" ),
});
