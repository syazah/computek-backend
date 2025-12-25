import { HttpStatus } from "http-status-ts"
import { HttpException } from "../services/responses/HttpException.js"
import { ProductDB } from "../db/product.js"
import { costItemValidationSchema, pageSizeValidationSchema, paperConfigValidationSchema, ProductValidationSchema, SheetValidationSchema, type IProduct } from "../validations/ProductValidations.js"
import { CostItem, PageSize, PaperConfig, Product, Sheet } from "../schema/Product.js"
import mongoose from "mongoose"
import { successResponse } from "../services/responses/successResponse.js"
import { Applicability, CostItemEnum } from "../enums/ProductEnum.js"

const productService = ProductDB.getInstance()

export const addPageSize = async (req: any, res: any) => {
    try {
        const body = req.body;
        const validation = pageSizeValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid page size data")
        }
        const addedPageSize = await productService.create(PageSize, validation.data)
        res.status(HttpStatus.CREATED).json(successResponse(addedPageSize, "Page size added successfully"))
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
        res.status(HttpStatus.OK).json(successResponse(pageSizes, "Page sizes fetched successfully"))
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
        res.status(HttpStatus.OK).json(successResponse(pageSize, "Page size fetched successfully"));
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
        res.status(HttpStatus.OK).json(successResponse(deletedPageSize, "Page size deleted successfully"));
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
        res.status(HttpStatus.OK).json(successResponse(updatedPageSize, "Page size updated successfully"));
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
        res.status(HttpStatus.CREATED).json(successResponse(addedPaperConfig, "Paper config added successfully"))
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
        res.status(HttpStatus.OK).json(successResponse(paperConfigs, "Paper configs fetched successfully"))
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
        res.status(HttpStatus.OK).json(successResponse(paperConfig, "Paper config fetched successfully"));
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
        res.status(HttpStatus.OK).json(successResponse(deletedPaperConfig, "Paper config deleted successfully"));
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
        res.status(HttpStatus.OK).json(successResponse(updatedPaperConfig, "Paper config updated successfully"));
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
        res.status(HttpStatus.CREATED).json(successResponse(addedCostItem, "Cost item added successfully"))
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to add cost item: ${(error as Error).message}`
        )
    }
}

export const getApplicability = async (req: any, res: any) => {
    try {
        const applicabilityOptions = Object.values(Applicability);
        res.status(HttpStatus.OK).json(successResponse(applicabilityOptions, "Applicability options fetched successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch applicability options: ${(error as Error).message}`
        );
    }
}

export const getCostItemEnums = async (req: any, res: any) => {
    try {
        const costItemEnums = Object.values(CostItemEnum);
        res.status(HttpStatus.OK).json(successResponse(costItemEnums, "Cost item enums fetched successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch cost item enums: ${(error as Error).message}`
        );
    }
}

export const getAllCostItems = async (req: any, res: any) => {
    try {
        const costItems = await productService.getAll(CostItem);
        res.status(HttpStatus.OK).json(successResponse(costItems, "Cost items fetched successfully"))
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
        res.status(HttpStatus.OK).json(successResponse(costItem, "Cost item fetched successfully"));
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
        res.status(HttpStatus.OK).json(successResponse(deletedCostItem, "Cost item deleted successfully"));
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
        res.status(HttpStatus.OK).json(successResponse(updatedCostItem, "Cost item updated successfully"));
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
        res.status(HttpStatus.CREATED).json(successResponse(addedProduct, "Product added successfully"))
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
        res.status(HttpStatus.OK).json(successResponse(products, "Products fetched successfully"));
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
        res.status(HttpStatus.OK).json(successResponse(product, "Product fetched successfully"));
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
        res.status(HttpStatus.OK).json(successResponse(deletedProduct, "Product deleted successfully"));
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
        res.status(HttpStatus.OK).json(successResponse(updatedProduct, "Product updated successfully"));
    }
    catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to update product: ${(error as Error).message}`
        );
    }
};


//SHEETS
export const getAllSheets = async (req: any, res: any) => {
    try {
        const sheets = await productService.getAll(Sheet);
        res.status(HttpStatus.OK).json(successResponse(sheets, "Sheets fetched successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch sheets: ${(error as Error).message}`
        )
    }
}

export const addSheet = async (req: any, res: any) => {
    try {
        const body = req.body;
        const validation = SheetValidationSchema.safeParse(body);
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, "Invalid sheet data");
        }
        const sheetData = {
            ...validation.data,
            width: validation.data.width,
            height: validation.data.height
        };
        const newSheet = await productService.create(Sheet, sheetData);
        res.status(HttpStatus.CREATED).json(successResponse(newSheet, "Sheet added successfully"));
    } catch (error) {
        throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            `Failed to add sheet: ${(error as Error).message}`
        )
    }
}
