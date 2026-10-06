import { Router } from "express";
import { DriverController } from "./driver.controller";

import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";

const router = Router();

router.post("/application", DriverController.createDriverApplication);
router.get(
	"/application",
	auth(Role.ADMIN),
	DriverController.getAllDriverApplications,
);
router.get("/application/:id", DriverController.getSingleDriverApplication);

export const DriverRoutes = router;
