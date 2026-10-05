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
router.patch("/:id",auth(Role.ADMIN), AmbulanceController.updateAmbulance);
router.delete('/:id',auth(Role.ADMIN),AmbulanceController.deleteAmbulance)

export const AmbulanceRoutes = router;
