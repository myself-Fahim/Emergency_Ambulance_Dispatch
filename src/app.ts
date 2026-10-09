import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { AmbulanceRoutes } from "./app/module/ambulance/ambulance.route";
import { DriverRoutes } from "./app/module/driver/driver.route";
import { BookingRoutes } from "./app/module/booking/booking.route";
import { paymentController } from "./app/module/payment/payment.controller";
import paymentRouter from "./app/module/payment/payment.route";

const app: Application = express();
app.post(
	"/payments/webhook",
	express.raw({ type: "application/json" }),
	paymentController.webhook,
);
app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/ambulance", AmbulanceRoutes);
app.use("/api/v1/driver", DriverRoutes);
app.use("/api/v1/bookings", BookingRoutes);
app.use("/api/v1/payments", paymentRouter);

// Basic route
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to Ambulance Dispatch System Backend",
	});
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
