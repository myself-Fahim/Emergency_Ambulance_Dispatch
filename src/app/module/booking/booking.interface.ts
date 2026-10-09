import { BookingPriority } from "../../../generated/prisma/enums";

export interface ICreateBooking {
	customerName: string;
	customerPhone: string;
	emergencyType: "ACCIDENT" | "CARDIAC" | "PREGNANCY" | "FIRE" | "OTHER";
	ambulanceType: "BASIC" | "ICU" | "CARDIAC" | "NEONATAL";
	pickupAddress: string;
	destinationAddress?: string;
}

export const priorityMap: Record<
	ICreateBooking["emergencyType"],
	BookingPriority
> = {
	ACCIDENT: BookingPriority.CRITICAL,
	CARDIAC: BookingPriority.CRITICAL,
	PREGNANCY: BookingPriority.HIGH,
	FIRE: BookingPriority.HIGH,
	OTHER: BookingPriority.LOW,
};
export const bookingFairMap: Record<ICreateBooking["ambulanceType"], number> = {
	BASIC: 1000,
	ICU: 3500,
	CARDIAC: 5000,
	NEONATAL: 1500,
};

export interface IAssignBooking {
	driverId: string;
	ambulanceId: string;
}
