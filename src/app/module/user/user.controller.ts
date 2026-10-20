import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";

const uploadImage = catchAsync(async (req: Request, res: Response) => {

	if(!req.file){
		throw new Error('No image found')
	}

	
	const uploadFile = req.file.buffer
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	// biome-ignore lint/suspicious/noNonNullAssertedOptionalChain: <explanation>
		const result  = await UserService.uploadImage(uploadFile,req.user?.userId!);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Image uploaded successfully",
		data: result,
	});
});

export const UserController = {
	uploadImage,
};
