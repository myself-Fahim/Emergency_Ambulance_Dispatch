import z from "zod";

export const createBookingSchema = z.object({
	customerName: z.string().min(3, "Patient name must be at least 3 characters"),

	customerPhone: z
		.string()
		.length(11, "Phone number must be exactly 11 digits")
		.regex(/^01[3-9]\d{8}$/, "Invalid phone number"),

	emergencyType: z.enum(["ACCIDENT", "CARDIAC", "PREGNANCY", "FIRE", "OTHER"]),

	ambulanceType: z.enum(["BASIC", "ICU", "CARDIAC", "NEONATAL"]),

	pickupAddress: z
		.string()
		.min(5, "Pickup address must be at least 5 characters")
		.max(500, "Pickup address is too long"),

	destinationAddress: z
		.string()
		.max(500, "Destination address is too long")
		.optional(),
});
