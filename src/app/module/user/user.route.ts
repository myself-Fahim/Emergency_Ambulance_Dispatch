import { Router } from "express";
import { UserController } from "./user.controller";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";


const router = Router();

router.patch(
    "/upload-image",auth(Role.ADMIN,Role.CUSTOMER,Role.DRIVER),upload.single("image"),UserController.uploadImage,
);

export const UserRoutes = router;
