import { Router } from "express";
import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";
import orderRouter from "./routes/order.js";
import productRouter from "./routes/product.js";

const routes = Router();

routes.use("/v1/user", userRouter)
routes.use("/v1/auth", authRouter)
routes.use("/v1/order", orderRouter)
routes.use("/v1/product", productRouter)

export default routes;
