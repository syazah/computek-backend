import { Router } from "express";
import { createDownloads, getAllDownloads } from "../controllers/downloads.js";


const downloadsRouter = Router();

downloadsRouter.route("/").post(createDownloads).get(getAllDownloads);

export default downloadsRouter;
