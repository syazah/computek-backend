import { Router } from "express";
import multer from "multer";
import { createOrder } from "../controllers/order.js";
const orderRouter = Router()
const storage = multer.memoryStorage()
const upload = multer({storage: storage})

orderRouter.post("/create", upload.single('file'), createOrder)

export default orderRouter;