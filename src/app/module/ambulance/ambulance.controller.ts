import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AmbulanceService } from "./ambulance.service";
import { createAmbulanceSchema } from "./ambulance.validation";

const createAmbulance = catchAsync(async (req: Request, res: Response) => {
	const payload = createAmbulanceSchema.parse(req.body);
	const result = await AmbulanceService.createAmbulance(payload);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Ambulance created successfully",
		data: result,
	});
});
const getAllAmbulance = catchAsync(async (req: Request, res: Response) => {
	const result = await AmbulanceService.getAllAmbulance();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Ambulance retreieve successfully",
		data: result,
	});
});

const getSingleAmbulance = catchAsync(async (req: Request, res: Response) => {
	const ambulanceId = req.params.id as string;
	const result = await AmbulanceService.getSingleAmbulance(ambulanceId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Ambulance retrieve successfully",
		data: result,
	});
});

export const AmbulanceController = {
	createAmbulance,
	getAllAmbulance,
	getSingleAmbulance,
};
