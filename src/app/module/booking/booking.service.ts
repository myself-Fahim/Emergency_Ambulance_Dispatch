import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
	bookingFairMap,
	ICreateBooking,
	priorityMap,
} from "./booking.interface";

const createBooking = async (payload: ICreateBooking, userId?: string) => {
	const customer = await prisma.customer.findUnique({
		where: {
			userId,
		},
	});

	if (!customer) {
		throw new Error("Customer profile not found");
	}

	const priority = priorityMap[payload.emergencyType];

	const estimatedFare = bookingFairMap[payload.ambulanceType];

	const result = await prisma.$transaction(async (tx) => {
		const booking = await tx.booking.create({
			data: {
				customerId: customer.id,

				CustomerName: payload.customerName,
				CustomerPhone: payload.customerPhone,

				emergencyType: payload.emergencyType,
				ambulanceType: payload.ambulanceType,

				pickupAddress: payload.pickupAddress,
				destinationAddress: payload.destinationAddress,

				priority,
				status: BookingStatus.PENDING,

				estimatedFare,
			},
		});

		const payment = await tx.payment.create({
			data: {
				bookingId: booking.id,
				amount: estimatedFare,
				currency: "BDT",
				status: "PENDING",
			},
		});

		return {
			booking,
			payment,
		};
	});

	return result;
};

const getMyBookings = async (userId?: string) => {
	const customer = await prisma.customer.findUnique({
		where: {
			userId,
		},
	});

	if (!customer) {
		throw new Error("Customer profile not found");
	}

	const bookings = await prisma.booking.findMany({
		where: {
			customerId: customer.id,
			isDeleted: false,
		},
		include: {
			payment: true,
		},
	});

	if (!bookings || bookings.length === 0) {
		throw new Error("No booking found");
	}

	return bookings;
};

const getAllBookings = async () => {
	const bookings = await prisma.booking.findMany({
		where: {
			isDeleted: false,
		},
		include: {
			payment: true,
		},
	});

	if (!bookings || bookings.length === 0) {
		throw new Error("No booking found");
	}

	return bookings;
};

const getBookingById = async (id: string) => {
	const booking = await prisma.booking.findUnique({
		where: {
			id,
			isDeleted: false,
		},
		include: {
			payment: true,
		},
	});

	if (!booking) {
		throw new Error("No booking found");
	}

	return booking;
};

const assignBooking = async (_id: string, _payload: unknown) => {};

const acceptBooking = async (_id: string) => {};

const startBooking = async (_id: string) => {};

const completeBooking = async (_id: string) => {};

const cancelBooking = async (_id: string) => {};

export const BookingService = {
	createBooking,
	getMyBookings,
	getAllBookings,
	getBookingById,
	assignBooking,
	acceptBooking,
	startBooking,
	completeBooking,
	cancelBooking,
};
