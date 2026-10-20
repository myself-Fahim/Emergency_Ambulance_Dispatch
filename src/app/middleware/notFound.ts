import type { Request, Response } from "express";
import httpStatus from "http-status";

export const notFound = (req: Request, res: Response) => {
	console.log("NOT FOUND:", req.method, req.originalUrl);

	res.status(httpStatus.NOT_FOUND).json({
		message: "Route not found",
		path: req.originalUrl,
		date: new Date(),
	});
};
