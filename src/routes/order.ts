import { Router } from "express";
import multer from "multer";
import { addBillingInfoToOrder, createOrder, getAllOrders, getOrderById, getOrderByIdAndUser, uploadBillingProof, uploadOrderFile, assignOrder, updateOrderController, getOrderByStatus, deleteOrderById } from "../controllers/order.js";
import { adminMiddleware } from "../middlewares/admin.js";

const orderRouter = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Creating Order
orderRouter.route("/").post(createOrder).get(adminMiddleware, getAllOrders)
orderRouter.get("/status/:status", adminMiddleware, getOrderByStatus)
orderRouter.post("/upload", upload.single('file'), uploadOrderFile)

// Get Order By Id
orderRouter.route("/:id",).get(adminMiddleware, getOrderById).delete(adminMiddleware, deleteOrderById)
orderRouter.get("/:id/user", getOrderByIdAndUser)
// Assign order (admin only)
orderRouter.patch("/:id/assign", adminMiddleware, assignOrder)
orderRouter.patch("/:id/update", adminMiddleware, updateOrderController)
// Add Billing Info to Order
orderRouter.post("/:id/add-billing-info/upload", upload.single('bill'), uploadBillingProof)
orderRouter.post("/:id/add-billing-info", addBillingInfoToOrder)


export default orderRouter;