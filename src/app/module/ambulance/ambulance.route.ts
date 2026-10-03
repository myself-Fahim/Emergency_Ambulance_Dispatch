import { Router } from "express";
import { AmbulanceController } from "./ambulance.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
	"/provider/create",
	auth(Role.ADMIN),
	AmbulanceController.createAmbulance,
);
router.get("/", AmbulanceController.getAllAmbulance);
router.get("/:id", AmbulanceController.getSingleAmbulance);

export const AmbulanceRoutes = router;
