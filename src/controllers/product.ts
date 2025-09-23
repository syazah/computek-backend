import { HttpStatus } from "http-status-ts"
import { HttpException } from "../services/ErrorHandling/HttpException.js"
import { ProductDB } from "../db/product.js"
import { costItemValidationSchema, pageSizeValidationSchema, paperConfigValidationSchema, ProductValidationSchema, type IProduct } from "../validations/ProductValidations.js"

const productService = ProductDB.getInstance()

export const addPageSize = async (req: any, res: any) => {
    try {
        const body = req.body;
        const validation = pageSizeValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid page size data")
        }
        const addedPageSize = await productService.addPageSize(validation.data)
        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Page size added successfully",
            data: addedPageSize
        })
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to add page size: ${(error as Error).message}`
        )
    }
}

export const getAllPageSizes = async (req: any, res: any) => {
    try {
        const pageSizes = await productService.getAllPageSizes()
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Page sizes fetched successfully",
            data: pageSizes
        })
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch page sizes: ${(error as Error).message}`
        )
    }
}

export const addPaperConfig = async (req: any, res: any) => {
    try {
        const body = req.body;
        const validation = paperConfigValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid paper config data")
        }
        const addedPaperConfig = await productService.addPaperConfigs(validation.data)
        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Paper config added successfully",
            data: addedPaperConfig
        })
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to add paper config: ${(error as Error).message}`
        )
    }
}
export const getAllPaperConfigs = async (req: any, res: any) => {
    try {
        const paperConfigs = await productService.getAllPaperConfigs();
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Paper configs fetched successfully",
            data: paperConfigs
        })
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch paper configs: ${(error as Error).message}`
        )
    }
}

export const addCostItem = async (req: any, res: any) => {
    try {
        const body = req.body;
        const validation = costItemValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid cost item data")
        }
        const addedCostItem = await productService.addCostItem(validation.data)
        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Cost item added successfully",
            data: addedCostItem
        })
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to add cost item: ${(error as Error).message}`
        )
    }
}

export const getAllCostItems = async (req: any, res: any) => {
    try {
        const costItems = await productService.getAllCostItems();
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Cost items fetched successfully",
            data: costItems
        })
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch cost items: ${(error as Error).message}`
        )
    }
}

export const addProduct = async (req: any, res: any) => {
    try {
        const body: IProduct = req.body;
        const validation = ProductValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid product data")
        }
        const addedProduct = await productService.addProduct(validation.data)
        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Product added successfully",
            data: addedProduct
        })
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to add product: ${(error as Error).message}`
        )
    }
}

export const getAllProducts = async (req: any, res: any) => {
    try {
        const products = await productService.getAllProducts();
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Products fetched successfully",
            data: products
        })
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch products: ${(error as Error).message}`
        )
    }
}
