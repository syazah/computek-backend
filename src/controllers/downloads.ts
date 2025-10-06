import { HttpStatus } from "http-status-ts"
import { HttpException } from "../services/responses/HttpException.js"

export const createDownloads = async (req: any, res: any) => {
    try {

    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            `An error occurred while creating downloadables. ${error}`)
    }
}

export const getAllDownloads = async (req: any, res: any) => {
    try {

    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR,
            `An error occurred while fetching downloadables. ${error}`)
    }
}