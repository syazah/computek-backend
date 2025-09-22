import { Router } from "express";
import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";

const routes = Router();

routes.use("/v1/user", userRouter)
routes.use("/v1/auth", authRouter)

export default routes;
