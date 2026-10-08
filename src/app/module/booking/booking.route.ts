import { Router } from "express";
import { BookingController } from "./booking.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.CUSTOMER), BookingController.createBooking);
router.get("/", auth(Role.ADMIN), BookingController.getAllBookings);
router.get("/my", auth(Role.CUSTOMER), BookingController.getMyBookings);
router.get("/:id", auth(Role.ADMIN), BookingController.getBookingById);
router.post("/assign/:id", auth(Role.ADMIN), BookingController.assignBooking);
router.post("/accept/:id", auth(Role.DRIVER), BookingController.acceptBooking);
router.post(
	"/start/:id",
	auth(Role.ADMIN, Role.DRIVER),
	BookingController.startBooking,
);
router.post(
	"/complete/:id",
	auth(Role.DRIVER, Role.ADMIN),
	BookingController.completeBooking,
);
router.post(
	"/cancel/:id",
	auth(Role.CUSTOMER),
	BookingController.cancelBooking,
);

export const BookingRoutes = router;
