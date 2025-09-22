import { Router } from "express";
import { createUserBasedOnUserType, getUserBasedOnUserType } from "../controllers/user.js";

const userRouter = Router()

userRouter.get("/:userType", getUserBasedOnUserType)
userRouter.post("/:userType/create", createUserBasedOnUserType)

export default userRouter;