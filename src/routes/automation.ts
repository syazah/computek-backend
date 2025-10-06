import { Router } from "express";
import { getAllAutomations, startAutomation, getAutomationById } from "../controllers/automation.js";

const automationRouter = Router();

automationRouter.route("/").post(startAutomation).get(getAllAutomations)
automationRouter.get('/:id', getAutomationById);

export default automationRouter;