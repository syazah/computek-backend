import { Vendor } from "../schema/Vendors.js";
import type { VendorType } from "../validations/VendorValidations.js";

export class VendorsDB {
    private static instance: VendorsDB;

    private constructor() { }

    public static getInstance(): VendorsDB {
        if (!VendorsDB.instance) {
            VendorsDB.instance = new VendorsDB();
        }
        return VendorsDB.instance;
    }

    public async getAllVendors() {
        const vendors = await Vendor.find();
        return vendors;
    }

    public async createVendor(vendorData: VendorType) {
        const newVendor = new Vendor(vendorData);
        await newVendor.save();
        return newVendor;
    }

    public async getVendorById(vendorId: string) {
        const vendor = await Vendor.findById(vendorId);
        return vendor;
    }

    public async updateVendor(vendorId: string, vendorData: Partial<VendorType>) {
        const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, vendorData, { new: true });
        return updatedVendor;
    }

    public async deleteVendor(vendorId: string) {
        return await Vendor.findByIdAndDelete(vendorId);
    }
}