import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DriverService } from "./driver.service";
import {
	createDriverApplicationSchema,
	driverApplicationParamsSchema,
} from "./driver.validation";

const createDriverApplication = catchAsync(
	async (req: Request, res: Response) => {
		const payload = createDriverApplicationSchema.parse(req.body);
		const result = await DriverService.createDriverApplication(payload);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Driver application submitted successfully",
			data: result,
		});
	},
);

const getAllDriverApplications = catchAsync(
	async (_req: Request, res: Response) => {
		const result = await DriverService.getAllDriverApplications();

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Driver applications retrieved successfully",
			data: result,
		});
	},
);

const getApplicationForPublic = catchAsync(
	async (req: Request, res: Response) => {
		const payload = req.body;
		const result = await DriverService.getApplicationForPublic(payload);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Driver application retrieved successfully",
			data: result,
		});
	},
);

const getSingleDriverApplication = catchAsync(
	async (req: Request, res: Response) => {
		const { id } = driverApplicationParamsSchema.parse(req.params);
		const result = await DriverService.getSingleDriverApplication(id);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Driver application retrieved successfully",
			data: result,
		});
	},
);
const approvedDriverApplication = catchAsync(
	async (req: Request, res: Response) => {
		const { id } = driverApplicationParamsSchema.parse(req.params);
		const { user, driver } = await DriverService.approvedDriverApplication(id);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Driver application approved successfully",
			data: {
				user,
				driver,
			},
		});
	},
);
const rejectDriverApplication = catchAsync(
	async (req: Request, res: Response) => {
		const { id } = driverApplicationParamsSchema.parse(req.params);
		const result = await DriverService.rejectDriverApplication(id);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Driver application deleted successfully",
			data: result,
		});
	},
);
const getAllDriver = catchAsync(async (req: Request, res: Response) => {
	const result = await DriverService.getAllDriver();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Drivers retrieved successfully",
		data: result,
	});
});
const getSingleDriver = catchAsync(async (req: Request, res: Response) => {
	const { id } = driverApplicationParamsSchema.parse(req.params);
	const result = await DriverService.getSingleDriver(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Drivers retrieved successfully",
		data: result,
	});
});

export const DriverController = {
	createDriverApplication,
	getAllDriverApplications,
	getSingleDriverApplication,
	getApplicationForPublic,
	approvedDriverApplication,
	rejectDriverApplication,
	getAllDriver,
	getSingleDriver,
};
