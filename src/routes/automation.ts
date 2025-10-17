import { Router } from "express";
import { getAllAutomations, startAutomation, getAutomationById, deleteAutomationById } from "../controllers/automation.js";

const automationRouter = Router();

automationRouter.route("/").post(startAutomation).get(getAllAutomations)
automationRouter.route('/:id').get(getAutomationById).delete(deleteAutomationById);

export default automationRouter;