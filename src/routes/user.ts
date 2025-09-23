import { Router } from "express";
import { createUserBasedOnUserType, getUserBasedOnUserType } from "../controllers/user.js";
import { authMiddleware } from "../middlewares/auth.js";
import { adminMiddleware } from "../middlewares/admin.js";

const userRouter = Router()

userRouter.get("/:userType", authMiddleware, adminMiddleware, getUserBasedOnUserType)
userRouter.post("/:userType/create", authMiddleware, adminMiddleware, createUserBasedOnUserType)

export default userRouter;