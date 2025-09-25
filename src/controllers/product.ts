import { HttpStatus } from "http-status-ts"
import { HttpException } from "../services/ErrorHandling/HttpException.js"
import { ProductDB } from "../db/product.js"
import { costItemValidationSchema, pageSizeValidationSchema, paperConfigValidationSchema, ProductValidationSchema, type IProduct } from "../validations/ProductValidations.js"
import { CostItem, PageSize, PaperConfig, Product } from "../schema/Product.js"
import mongoose from "mongoose"

const productService = ProductDB.getInstance()

export const addPageSize = async (req: any, res: any) => {
    try {
        const body = req.body;
        const validation = pageSizeValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid page size data")
        }
        const addedPageSize = await productService.create(PageSize, validation.data)
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
        const pageSizes = await productService.getAll(PageSize)
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

export const getPageSizeFromPageId = async (req: any, res: any) => {
    try {
        const pageSizeId = req.params.pageSizeId;
        const pageSize = await productService.getById(PageSize, pageSizeId);
        if (!pageSize) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Page size not found with ID: ${pageSizeId}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Page size fetched successfully",
            data: pageSize
        });
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch page size: ${(error as Error).message}`
        );
    }
}

export const deletePageSize = async (req: any, res: any) => {
    try {
        const pageSizeId = req.params.pageSizeId;
        const deletedPageSize = await productService.deleteById(PageSize, pageSizeId);
        if (!deletedPageSize) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Page size not found with ID: ${pageSizeId}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Page size deleted successfully",
            data: deletedPageSize
        });
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to delete page size: ${(error as Error).message}`
        );
    }
}

export const updatePageSize = async (req: any, res: any) => {
    try {
        const pageSizeId = req.params.pageSizeId;
        const body = req.body;
        const validation = pageSizeValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid page size data");
        }
        const updatedPageSize = await productService.updateById(PageSize, pageSizeId, validation.data);
        if (!updatedPageSize) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Page size not found with ID: ${pageSizeId}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Page size updated successfully",
            data: updatedPageSize
        });
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to update page size: ${(error as Error).message}`
        );
    }
}

//PAPER CONFIGS
export const addPaperConfig = async (req: any, res: any) => {
    try {
        const body = req.body;
        const validation = paperConfigValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid paper config data")
        }
        const addedPaperConfig = await productService.create(PaperConfig, validation.data)
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
        const paperConfigs = await productService.getAll(PaperConfig);
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
export const getPaperConfigFromPaperId = async (req: any, res: any) => {
    try {
        const paperConfigId = req.params.paperConfigId;
        const paperConfig = await productService.getById(PaperConfig, paperConfigId);
        if (!paperConfig) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Paper config not found with ID: ${paperConfigId}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Paper config fetched successfully",
            data: paperConfig
        });
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch paper config: ${(error as Error).message}`
        );
    }
}
export const deletePaperConfig = async (req: any, res: any) => {
    try {
        const paperConfigId = req.params.paperConfigId;
        const deletedPaperConfig = await productService.deleteById(PaperConfig, paperConfigId);
        if (!deletedPaperConfig) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Paper config not found with ID: ${paperConfigId}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Paper config deleted successfully",
            data: deletedPaperConfig
        });
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to delete paper config: ${(error as Error).message}`
        );
    }
}
export const updatePaperConfig = async (req: any, res: any) => {
    try {
        const paperConfigId = req.params.paperConfigId;
        const body = req.body;
        const validation = paperConfigValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid paper config data");
        }
        const updatedPaperConfig = await productService.updateById(PaperConfig, paperConfigId, validation.data);
        if (!updatedPaperConfig) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Paper config not found with ID: ${paperConfigId}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Paper config updated successfully",
            data: updatedPaperConfig
        });
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to update paper config: ${(error as Error).message}`
        );
    }
}

// COST ITEMS
export const addCostItem = async (req: any, res: any) => {
    try {
        const body = req.body;
        const validation = costItemValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, `Invalid cost item data: ${validation.error.message}`)
        }
        const addedCostItem = await productService.create(CostItem, validation.data)
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
        const costItems = await productService.getAll(CostItem);
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
export const getCostItemFromCostId = async (req: any, res: any) => {
    try {
        const costItemId = req.params.costItemId;
        const costItem = await productService.getById(CostItem, costItemId);
        if (!costItem) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Cost item not found with ID: ${costItemId}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Cost item fetched successfully",
            data: costItem
        });
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch cost item: ${(error as Error).message}`
        );
    }
}
export const deleteCostItem = async (req: any, res: any) => {
    try {
        const costItemId = req.params.costItemId;
        const deletedCostItem = await productService.deleteById(CostItem, costItemId);
        if (!deletedCostItem) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Cost item not found with ID: ${costItemId}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Cost item deleted successfully",
            data: deletedCostItem
        });
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to delete cost item: ${(error as Error).message}`
        );
    }
}
export const updateCostItem = async (req: any, res: any) => {
    try {
        const costItemId = req.params.costItemId;
        const body = req.body;
        const validation = costItemValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid cost item data");
        }
        const updatedCostItem = await productService.updateById(CostItem, costItemId, validation.data);
        if (!updatedCostItem) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Cost item not found with ID: ${costItemId}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Cost item updated successfully",
            data: updatedCostItem
        });
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to update cost item: ${(error as Error).message}`
        );
    }
}

// PRODUCTS
export const addProduct = async (req: any, res: any) => {
    try {
        const body: IProduct = req.body;
        const validation = ProductValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid product data")
        }
        const productData = {
            ...validation.data,
            availableSizes: validation.data.availableSizes.map(id => new mongoose.Types.ObjectId(id)),
            availablePapers: validation.data.availablePapers.map(id => new mongoose.Types.ObjectId(id)),
            costItems: validation.data.costItems?.map(id => new mongoose.Types.ObjectId(id)) || []
        };
        const addedProduct = await productService.create(Product, productData)
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
        const products = await productService.getAll(Product);
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

export const getProductFromProductId = async (req: any, res: any) => {
    try {
        const productId = req.params.productId; // Assuming productId is passed as a URL parameter
        const product = await productService.getById(Product, productId);
        if (!product) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Product not found with ID: ${productId}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Product fetched successfully",
            data: product
        });
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch product: ${(error as Error).message}`
        );
    }
}
export const deleteProduct = async (req: any, res: any) => {
    try {
        const productId = req.params.productId;
        const deletedProduct = await productService.deleteById(Product, productId);
        if (!deletedProduct) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Product not found with ID: ${productId}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Product deleted successfully",
            data: deletedProduct
        });
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to delete product: ${(error as Error).message}`
        );
    }
}
export const updateProduct = async (req: any, res: any) => {
    try {
        const productId = req.params.productId;
        const body: IProduct = req.body;
        const validation = ProductValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid product data");
        }
        const productData = {
            ...validation.data,
            availableSizes: validation.data.availableSizes.map(id => new mongoose.Types.ObjectId(id)),
            availablePapers: validation.data.availablePapers.map(id => new mongoose.Types.ObjectId(id)),
            costItems: validation.data.costItems?.map(id => new mongoose.Types.ObjectId(id)) || []
        };
        const updatedProduct = await productService.updateById(Product, productId, productData);
        if (!updatedProduct) {
            throw new HttpException(HttpStatus.NOT_FOUND, `Product not found with ID: ${productId}`);
        }
        res.status(HttpStatus.OK).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });
    }
    catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to update product: ${(error as Error).message}`
        );
    }
};
