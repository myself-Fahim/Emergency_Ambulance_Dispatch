import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AmbulanceService } from "./ambulance.service";
import {
	ambulanceParamsSchema,
	ambulanceUpdateSchema,
	createAmbulanceSchema,
} from "./ambulance.validation";

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
	const { id } = ambulanceParamsSchema.parse(req.params);
	const result = await AmbulanceService.getSingleAmbulance(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Ambulance retrieve successfully",
		data: result,
	});
});

const updateAmbulance = catchAsync(async (req: Request, res: Response) => {
	const payload = ambulanceUpdateSchema.parse(req.body);
	const { id } = ambulanceParamsSchema.parse(req.params);
	const result = await AmbulanceService.updateAmbulance(payload, id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Ambulance retrieve successfully",
		data: result,
	});
});
const deleteAmbulance = catchAsync(async (req: Request, res: Response) => {
	const { id } = ambulanceParamsSchema.parse(req.params);
	const result = await AmbulanceService.deleteAmbulance(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Ambulance deleted successfully",
		data: result,
	});
});

export const AmbulanceController = {
	createAmbulance,
	getAllAmbulance,
	getSingleAmbulance,
	updateAmbulance,
	deleteAmbulance,
};
