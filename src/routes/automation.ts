import { Router } from "express";
import { getAllAutomations, startAutomation, getAutomationById, deleteAutomationById, addManualAutomation, uploadManualAutomationFile, getAllManualAutomations, deleteManualAutomationById, getManualAutomationById } from "../controllers/automation.js";
import multer from "multer";
const automationRouter = Router();

const storage = multer.memoryStorage()
// Enforce 1MB size limit for manual automation uploads (accept all file types)
const upload = multer({ storage: storage, limits: { fileSize: 1 * 1024 * 1024 } })

// Important: define static/manual routes BEFORE parameterized ':id' route
automationRouter.post("/manual/upload", upload.single("file"), uploadManualAutomationFile);
automationRouter.route("/manual").post(addManualAutomation).get(getAllManualAutomations);
automationRouter.route("/manual/:id").delete(deleteManualAutomationById).get(getManualAutomationById);

automationRouter.route("/").post(startAutomation).get(getAllAutomations)
automationRouter.route('/:id').get(getAutomationById).delete(deleteAutomationById);

export default automationRouter;