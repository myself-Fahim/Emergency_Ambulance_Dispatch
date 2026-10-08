import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingService } from "./booking.service";
import { createBookingSchema } from "./booking.validation";

const createBooking = catchAsync(async (req: Request, res: Response) => {
	const payload = createBookingSchema.parse(req.body);
	const { booking, payment } = await BookingService.createBooking(
		payload,
		req.user?.userId,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Booking created successfully",
		data: {
			booking,
			payment,
		},
	});
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.getMyBookings(req.user?.userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Bookings retrieved successfully",
		data: result,
	});
});

const getAllBookings = catchAsync(async (_req: Request, res: Response) => {
	const result = await BookingService.getAllBookings();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Bookings retrieved successfully",
		data: result,
	});
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.getBookingById(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Booking retrieved successfully",
		data: result,
	});
});

const assignBooking = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.assignBooking(
		req.params.id as string,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Booking assigned successfully",
		data: result,
	});
});

const acceptBooking = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.acceptBooking(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Booking accepted successfully",
		data: result,
	});
});

const startBooking = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.startBooking(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Booking started successfully",
		data: result,
	});
});

const completeBooking = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.completeBooking(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Booking completed successfully",
		data: result,
	});
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.cancelBooking(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Booking cancelled successfully",
		data: result,
	});
});

export const BookingController = {
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
