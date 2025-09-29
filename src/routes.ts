import { Router } from "express";
import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";
import orderRouter from "./routes/order.js";
import productRouter from "./routes/product.js";
import { authMiddleware } from "./middlewares/auth.js";
import automationRouter from "./routes/automation.js";
import { adminMiddleware } from "./middlewares/admin.js";

const routes = Router();

routes.use("/v1/user", authMiddleware, userRouter)
routes.use("/v1/auth", authRouter)
routes.use("/v1/product", authMiddleware, productRouter)
routes.use("/v1/order", authMiddleware, orderRouter)
routes.use("/v1/automate", authMiddleware, adminMiddleware, automationRouter)

export default routes;
