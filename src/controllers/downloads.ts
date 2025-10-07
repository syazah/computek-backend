import { HttpStatus } from "http-status-ts"
import { HttpException } from "../services/responses/HttpException.js"
import { AWSHelper } from "../services/aws/client.js";
import { successResponse } from "../services/responses/successResponse.js";
import { DownloadDB } from "../db/download.js";

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'application/zip'];

const awsHelper = AWSHelper.getInstance();
const downloadDB = DownloadDB.getInstance();

export const uploadDownloadsFiles = async (req: any, res: any) => {
    try {
        const file = req.file;
        if (!file) {
            throw new HttpException(HttpStatus.BAD_REQUEST, 'No file uploaded');
        }
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new HttpException(HttpStatus.BAD_REQUEST, 'Unsupported file type');
        }
        const fileName = `${Date.now()}_${file.originalname}`;
        // Upload to AWS S3
        const result = await awsHelper.uploadFile(fileName, file.buffer, file.mimetype, "computek-downloads");
        res.status(HttpStatus.OK).json(successResponse(
            { fileUrl: result }, "File uploaded successfully"
        ));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            `An error occurred while uploading files. ${error}`)
    }
}

export const createDownloads = async (req: any, res: any) => {
    try {
        const { name, description, fileUrl } = req.body;
        if (!name || !fileUrl) {
            throw new HttpException(HttpStatus.BAD_REQUEST, 'Name and fileUrl are required');
        }
        const download = await downloadDB.createDownload({ name, description, fileUrl });
        res.status(HttpStatus.CREATED).json(successResponse(download, "Downloadable created successfully"));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            `An error occurred while creating downloadables. ${error}`)
    }
}

export const getAllDownloads = async (req: any, res: any) => {
    try {
        const downloads = await downloadDB.getAllDownloads();
        res.status(HttpStatus.OK).json(successResponse(downloads, "Downloadables fetched successfully"));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            `An error occurred while fetching downloadables. ${error}`)
    }
}