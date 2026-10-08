import { Router } from "express";
import { DriverController } from "./driver.controller";

import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";

const router = Router();

router.get("/", auth(Role.ADMIN), DriverController.getAllDriver);
router.get(
	"/application",
	auth(Role.ADMIN),
	DriverController.getAllDriverApplications,
);
router.get("/application/public", DriverController.getApplicationForPublic);
router.get(
	"/application/:id",
	auth(Role.ADMIN),
	DriverController.getSingleDriverApplication,
);
router.get("/:id", auth(Role.ADMIN), DriverController.getSingleDriver);

router.post("/application", DriverController.createDriverApplication);
router.patch(
	"/application/approved/:id",
	auth(Role.ADMIN),
	DriverController.approvedDriverApplication,
);
router.delete(
	"/application/reject/:id",
	auth(Role.ADMIN),
	DriverController.rejectDriverApplication,
);

export const DriverRoutes = router;
