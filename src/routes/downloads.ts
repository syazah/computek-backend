import { Router } from "express";
import { createDownloads, getAllDownloads, uploadDownloadsFiles } from "../controllers/downloads.js";
import { adminMiddleware } from "../middlewares/admin.js";
import multer from "multer";

const downloadsRouter = Router();
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


downloadsRouter.route("/").post(adminMiddleware, createDownloads).get(getAllDownloads);
downloadsRouter.post("/upload", adminMiddleware, upload.single('file'), uploadDownloadsFiles);
export default downloadsRouter;
