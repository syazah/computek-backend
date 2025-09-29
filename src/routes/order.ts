import { Router } from "express";
import multer from "multer";
import { addBillingInfoToOrder, createOrder, getAllOrders, getOrderById, getOrderByIdAndUser, uploadBillingProof, uploadOrderFile } from "../controllers/order.js";
import { adminMiddleware } from "../middlewares/admin.js";

const orderRouter = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

orderRouter.route("/").post(createOrder).get(adminMiddleware, getAllOrders)
orderRouter.post("/upload", upload.single('file'), uploadOrderFile)
orderRouter.get("/:id", adminMiddleware, getOrderById)
orderRouter.get("/:id/user", getOrderByIdAndUser)
orderRouter.post("/:id/add-billing-info/upload", upload.single('bill'), uploadBillingProof)
orderRouter.post("/:id/add-billing-info", addBillingInfoToOrder)


export default orderRouter;