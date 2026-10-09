import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { getMyPayments, paymentController } from "./payment.controller";

const paymentRouter = Router();

paymentRouter.post(
	"/checkout/:id",
	auth(Role.CUSTOMER),
	paymentController.checkout,
);
paymentRouter.get("/my", auth(Role.CUSTOMER), getMyPayments);

export default paymentRouter;
