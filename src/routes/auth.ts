import {Router} from "express";
import { loginUser } from "../controllers/auth.js";

const authRouter = Router()

authRouter.post("/login", loginUser)

export default authRouter;