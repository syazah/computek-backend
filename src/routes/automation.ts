import { Router } from "express";
import { startAutomation } from "../controllers/automation.js";

const automationRouter = Router();

automationRouter.post("/", startAutomation)

export default automationRouter;