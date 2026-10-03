import z from "zod";
import { AmbulanceType } from "../../../generated/prisma/enums";

export const createAmbulanceSchema = z.object({
	name: z
		.string("Name is required")
		.min(3, "Name must be at least 3 characters"),

	email: z.email("email is required"),

	phone: z
		.string("Number is required")
		.length(11, "Phone number must be exactly 11 digits")
		.regex(/^01[3-9]\d{8}$/, "Invalid phone number"),

	address: z.string().optional(),

	ambulance: z.object({
		registrationNumber: z.string("Registration number is required"),

		type: z.enum(
			[
				AmbulanceType.BASIC,
				AmbulanceType.CARDIAC,
				AmbulanceType.ICU,
				AmbulanceType.NEONATAL,
			],
			"Type is required",
		),
	}),
});
