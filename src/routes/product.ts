import { Router } from "express"
import { addCostItem, addPageSize, addPaperConfig, addProduct, getAllCostItems, getAllPageSizes, getAllPaperConfigs, getAllProducts } from "../controllers/product.js"
import { adminMiddleware } from "../middlewares/admin.js"

const productRouter = Router()

productRouter.route("/page-size").get(getAllPageSizes).post(adminMiddleware, addPageSize)
productRouter.route("/paper-config").get(getAllPaperConfigs).post(adminMiddleware, addPaperConfig)
productRouter.route("/cost-item").get(getAllCostItems).post(adminMiddleware, addCostItem)

productRouter.route("/product").get(getAllProducts).post(adminMiddleware, addProduct)






export default productRouter