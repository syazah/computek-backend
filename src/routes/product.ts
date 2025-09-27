import { Router } from "express"
import { addCostItem, addPageSize, addPaperConfig, addProduct, addSheet, deleteCostItem, deletePageSize, deletePaperConfig, deleteProduct, getAllCostItems, getAllPageSizes, getAllPaperConfigs, getAllProducts, getAllSheets, getCostItemFromCostId, getPageSizeFromPageId, getPaperConfigFromPaperId, getProductFromProductId, updateCostItem, updatePageSize, updatePaperConfig, updateProduct } from "../controllers/product.js"
import { adminMiddleware } from "../middlewares/admin.js"

const productRouter = Router()

productRouter.route("/page-size").get(getAllPageSizes).post(adminMiddleware, addPageSize)
productRouter.route("/page-size/:pageSizeId").get(getPageSizeFromPageId).delete(adminMiddleware, deletePageSize).put(adminMiddleware, updatePageSize)

// PAPER CONFIGS
productRouter.route("/paper-config").get(getAllPaperConfigs).post(adminMiddleware, addPaperConfig)
productRouter.route("/paper-config/:paperConfigId").get(getPaperConfigFromPaperId).delete(adminMiddleware, deletePaperConfig).put(adminMiddleware, updatePaperConfig)

// COST ITEMS
productRouter.route("/cost-item").get(getAllCostItems).post(adminMiddleware, addCostItem)
productRouter.route("/cost-item/:costItemId").get(getCostItemFromCostId).delete(adminMiddleware, deleteCostItem).put(adminMiddleware, updateCostItem)

// PRODUCTS
productRouter.route("/product").get(getAllProducts).post(adminMiddleware, addProduct)
productRouter.route("/product/:productId").get(getProductFromProductId).delete(adminMiddleware, deleteProduct).put(adminMiddleware, updateProduct)

//SHEETS
productRouter.route("/sheets").get(getAllSheets).post(adminMiddleware, addSheet)






export default productRouter