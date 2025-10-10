import { Router } from "express"
import { createVendor, deleteVendor, getAllVendors, getVendorById, updateVendor } from "../controllers/vendor.js"

const vendorRouter = Router()

vendorRouter.route("/").get(getAllVendors).post(createVendor)
vendorRouter.route("/:id").get(getVendorById).patch(updateVendor).delete(deleteVendor)

export default vendorRouter