import { Router } from "express";
import { createUserBasedOnUserType, getAllUsers, getSingleUserInfo, getUserBasedOnUserType, updateSingleUserInfo } from "../controllers/user.js";
import { authMiddleware } from "../middlewares/auth.js";
import { adminMiddleware } from "../middlewares/admin.js";

const userRouter = Router()
userRouter.get("/", adminMiddleware, getAllUsers)
userRouter.route("/me").get(getSingleUserInfo).put(updateSingleUserInfo)
userRouter.get("/:userType", adminMiddleware, getUserBasedOnUserType)
userRouter.post("/:userType/create", adminMiddleware, createUserBasedOnUserType)


export default userRouter;