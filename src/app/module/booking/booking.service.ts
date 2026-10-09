import { error } from "node:console";
import {
	AmbulanceStatus,
	BookingStatus,
	DriverAvailability,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
	bookingFairMap,
	IAssignBooking,
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

const assignBooking = async (id: string, payload: IAssignBooking) => {
	const { driverId, ambulanceId } = payload;

	const bookingAssign = await prisma.$transaction(async (tx) => {
		const booking = await tx.booking.findUnique({
			where: {
				id,
				isDeleted: false,
			},
		});

		if (!booking) {
			throw new Error("Booking not found");
		}

		if (booking.status !== BookingStatus.PENDING) {
			throw new Error("Booking is already assigned");
		}

		const ambulance = await tx.ambulance.findUnique({
			where: {
				id: ambulanceId,
				isDeleted: false,
			},
		});

		if (!ambulance) {
			throw new Error("Ambulance not found");
		}

		if (ambulance.type !== booking.ambulanceType) {
			throw new Error("Ambulance don't match the booking requirement");
		}

		if (ambulance.status !== AmbulanceStatus.AVAILABLE) {
			throw new Error("Ambulance is not available");
		}

		await tx.ambulance.update({
			where: {
				id: ambulanceId,
				isDeleted: false,
				status: AmbulanceStatus.AVAILABLE,
			},
			data: {
				status: AmbulanceStatus.BUSY,
			},
		});

		const driver = await tx.driver.findUnique({
			where: {
				id: driverId,
				user: {
					isDeleted: false,
				},
			},
			include: {
				user: true,
			},
		});

		if (!driver) {
			throw new Error("Driver not found");
		}

		if (driver.availability !== DriverAvailability.AVAILABLE) {
			throw new Error("Driver is not available");
		}

		await tx.driver.update({
			where: {
				id: driverId,
				user: {
					isDeleted: false,
				},
				availability: DriverAvailability.AVAILABLE,
			},
			data: {
				availability: DriverAvailability.BUSY,
			},
		});

		const updateBooking = await tx.booking.update({
			where: {
				id: booking.id,
			},
			data: {
				driverId,
				ambulanceId,
				status: BookingStatus.ASSIGNED,
			},
			include: {
				driver: {
					include: {
						user: {
							select: {
								name: true,
								email: true,
							},
						},
					},
				},
				ambulance: true,
			},
		});

		return updateBooking;
	});

	return bookingAssign;
};

const acceptBooking = async (id: string,userId : string) => {

	const acceptBooking = await prisma.$transaction(async(tx)=>{

		const driver = await tx.driver.findUnique({
			where:{
				userId,
				user:{
					isDeleted:false
				}
			}
		})

		if(!driver){
			throw new Error('Driver not found')
		}

		const booking = await tx.booking.findUnique({
			where:{
				id,
				driverId:driver.id,
				status:BookingStatus.ASSIGNED,
				isDeleted:false
			}
		})

		console.log("booking",booking);

		if(!booking){
			throw new Error("Booking not found or can't be accepted")
		}


		const updateBooking = await tx.booking.update({
			where:{
				id : booking.id,
				status:BookingStatus.ASSIGNED,
				isDeleted:false
			},
			data:{
				status:BookingStatus.ACCEPTED
			},
			include:{
				driver:true,
				ambulance:true,	
			}
		})

		return updateBooking
	})

	return acceptBooking

};

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
