import { CostItem, PageSize, PaperConfig, Product } from "../schema/Product.js"
import type { ICostItem, IPageSize, IPaperConfig, IProduct } from "../validations/ProductValidations.js"

export class ProductDB {
    private static instance: ProductDB
    private constructor() { }

    public static getInstance(): ProductDB {
        if (!ProductDB.instance) {
            ProductDB.instance = new ProductDB()
        }
        return ProductDB.instance
    }

    public async addPageSize(pageSize: IPageSize) {
        const addedPage = await PageSize.create(pageSize)
        if (!addedPage) {
            throw new Error("Failed to add page size")
        }
        return addedPage
    }
    public async getAllPageSizes() {
        const pageSizes = await PageSize.find()
        return pageSizes
    }

    public async addPaperConfigs(paperConfig: IPaperConfig) {
        const addedPaperConfig = await PaperConfig.create(paperConfig)
        if (!addedPaperConfig) {
            throw new Error("Failed to add paper config")
        }
        return addedPaperConfig
    }
    public async getAllPaperConfigs() {
        const paperConfigs = await PaperConfig.find()
        return paperConfigs
    }

    public async addCostItem(costItem: ICostItem) {
        const addedCostItem = await CostItem.create(costItem)
        if (!addedCostItem) {
            throw new Error("Failed to add cost item")
        }
        return addedCostItem
    }
    public async getAllCostItems() {
        const costItems = await CostItem.find()
        return costItems
    }

    public async addProduct(product: IProduct) {
        // Implementation for adding a product
        const addedProduct = await Product.create(product)
        if (!addedProduct) {
            throw new Error("Failed to add product")
        }
        return addedProduct
    }
    public async getAllProducts() {
        // Implementation for fetching all products
        const products = await Product.find()
        return products
    }
}