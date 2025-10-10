import { HttpStatus } from "http-status-ts"
import { HttpException } from "../services/responses/HttpException.js"
import { VendorsDB } from "../db/vendors.js"
import { successResponse } from "../services/responses/successResponse.js"
import { VendorSchema } from "../validations/VendorValidations.js"

const vendorDB = VendorsDB.getInstance()

export const getAllVendors = async (req: any, res: any) => {
    try {
        const vendors = await vendorDB.getAllVendors()
        if (!vendors) {
            throw new HttpException(HttpStatus.NOT_FOUND, "No vendors found")
        }
        res.status(HttpStatus.OK).json(successResponse(
            vendors,
            "Vendors fetched successfully"
        ))
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch vendors")
    }
}

export const createVendor = async (req: any, res: any) => {
    try {
        const vendorData = req.body
        const validation = VendorSchema.safeParse(vendorData)
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, `Invalid vendor data ${validation.error}`)
        }
        const existingVendors = await vendorDB.getAllVendors()
        const duplicateVendor = existingVendors.find(vendor => vendor.gstNumber === vendorData.gstNumber)
        if (duplicateVendor) {
            throw new HttpException(HttpStatus.CONFLICT, "Vendor with this GST number already exists")
        }
        const newVendor = await vendorDB.createVendor(vendorData)
        res.status(HttpStatus.CREATED).json(successResponse(
            newVendor,
            "Vendor created successfully"
        ))
    } catch (error) {
        if (error instanceof HttpException) {
            throw error
        }
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create vendor")
    }
}

export const getVendorById = async (req: any, res: any) => {
    try {
        const vendorId = req.params.id
        const vendor = await vendorDB.getVendorById(vendorId)
        if (!vendor) {
            throw new HttpException(HttpStatus.NOT_FOUND, "Vendor not found")
        }
        res.status(HttpStatus.OK).json(successResponse(
            vendor,
            "Vendor fetched successfully"
        ))
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch vendor")
    }
}

export const updateVendor = async (req: any, res: any) => {
    try {
        const vendorId = req.params.id
        const vendorData = req.body
        const validation = VendorSchema.partial().safeParse(vendorData)
        if (!validation.success) {
            throw new HttpException(HttpStatus.BAD_REQUEST, `Invalid vendor data ${validation.error}`)
        }
        const existingVendor = await vendorDB.getVendorById(vendorId)
        if (!existingVendor) {
            throw new HttpException(HttpStatus.NOT_FOUND, "Vendor not found")
        }
        if (vendorData.gstNumber && vendorData.gstNumber !== existingVendor.gstNumber) {
            const allVendors = await vendorDB.getAllVendors()
            const duplicateVendor = allVendors.find(vendor => vendor.gstNumber === vendorData.gstNumber)
            if (duplicateVendor) {
                throw new HttpException(HttpStatus.CONFLICT, "Another vendor with this GST number already exists")
            }
        }
        const updatedVendor = await vendorDB.updateVendor(vendorId, vendorData)
        res.status(HttpStatus.OK).json(successResponse(
            updatedVendor,
            "Vendor updated successfully"
        ))
    } catch (error) {
        if (error instanceof HttpException) {
            throw error
        }
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update vendor")
    }
}

export const deleteVendor = async (req: any, res: any) => {
    try {
        const vendorId = req.params.id
        const existingVendor = await vendorDB.getVendorById(vendorId)
        if (!existingVendor) {
            throw new HttpException(HttpStatus.NOT_FOUND, "Vendor not found")
        }
        await vendorDB.deleteVendor(vendorId)
        res.status(HttpStatus.OK).json(successResponse(
            null,
            "Vendor deleted successfully"
        ))
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete vendor")
    }
}