import { Router } from "express";
import multer from "multer";
import { createOrder, getAllOrders, getOrderById, getOrderByIdAndUser } from "../controllers/order.js";
import { adminMiddleware } from "../middlewares/admin.js";

const orderRouter = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

orderRouter.route("/").post(upload.single('file'), createOrder).get(adminMiddleware, getAllOrders)
orderRouter.get("/:id", adminMiddleware, getOrderById)
orderRouter.get("/:id/user", getOrderByIdAndUser)

export default orderRouter;