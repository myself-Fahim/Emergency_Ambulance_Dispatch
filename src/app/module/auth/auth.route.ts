import { Router } from "express";
import { AuthController } from "./auth.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", AuthController.registerCustomer);

router.post("/verify-email", AuthController.verifyEmail);

router.post("/login", AuthController.loginUser);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/forget-password", AuthController.forgetPassword);

router.post("/reset-password", AuthController.resetPassword);

router.post("/google", AuthController.googleLogin);
router.get(
	"/me",
	auth(Role.CUSTOMER, Role.DRIVER, Role.ADMIN),
	AuthController.getMyProfile,
);

export const AuthRoutes = router;
