import { Router } from "express"
import { adminMiddleware } from "../middlewares/admin.js"
import { getAllAnalyticsController } from "../controllers/analytics.js"

const analyticsRouter = Router()


analyticsRouter.route("/admin").get(adminMiddleware, getAllAnalyticsController)

export default analyticsRouter