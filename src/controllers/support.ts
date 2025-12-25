import { HttpStatus } from "http-status-ts";
import { SupportClass } from "../db/support.js";
import { HttpException } from "../services/responses/HttpException.js";
import { successResponse } from "../services/responses/successResponse.js";
import { createSupportSchema } from "../validations/SupportValidations.js";
import mongoose from "mongoose";

const supportDB = SupportClass.getInstance();

export const createSupportTicket = async (req: any, res: any) => {
    try {
        const parsed = createSupportSchema.parse(req.body);
        const data = { ...parsed, raisedBy: req.user.id };
        const ticket = await supportDB.createTicket(data);
        res.status(HttpStatus.CREATED).json(successResponse(ticket, "Support ticket created successfully"));
    } catch (error: any) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Failed to create support ticket: ${error}`);
    }
}

export const getAllSupportTickets = async (req: any, res: any) => {
    try {
        const tickets = await supportDB.getAllTickets();
        res.status(HttpStatus.OK).json(successResponse(tickets, "Support tickets fetched successfully"));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Failed to fetch support tickets: ${error}`);
    }
}

export const getSupportTicketById = async (req: any, res: any) => {
    try {
        const id = req.params.id;
        if (!mongoose.isValidObjectId(id)) {
            throw new HttpException(HttpStatus.BAD_REQUEST, 'Invalid ticket id');
        }
        const ticket = await supportDB.getTicketById(id);
        if (!ticket) {
            throw new HttpException(HttpStatus.NOT_FOUND, 'Support ticket not found');
        }
        res.status(HttpStatus.OK).json(successResponse(ticket, "Support ticket fetched successfully"));
    } catch (error) {
        if (error instanceof HttpException) throw error;
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Failed to fetch support ticket: ${error}`);
    }
}

export const updateSupportTicketById = async (req: any, res: any) => {
    try {
        const id = req.params.id;
        if (!mongoose.isValidObjectId(id)) {
            throw new HttpException(HttpStatus.BAD_REQUEST, 'Invalid ticket id');
        }
        const data = req.body;
        const updatedTicket = await supportDB.updateTicketById(id, data);
        if (!updatedTicket) {
            throw new HttpException(HttpStatus.NOT_FOUND, 'Support ticket not found');
        }
        res.status(HttpStatus.OK).json(successResponse(updatedTicket, "Support ticket updated successfully"));
    } catch (error) {
        if (error instanceof HttpException) throw error;
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Failed to update support ticket: ${error}`);
    }
}

export const deleteSupportTicketById = async (req: any, res: any) => {
    try {
        const id = req.params.id;
        if (!mongoose.isValidObjectId(id)) {
            throw new HttpException(HttpStatus.BAD_REQUEST, 'Invalid ticket id');
        }
        const deletedTicket = await supportDB.deleteTicketById(id);
        if (!deletedTicket) {
            throw new HttpException(HttpStatus.NOT_FOUND, 'Support ticket not found');
        }
        res.status(HttpStatus.OK).json(successResponse(deletedTicket, "Support ticket deleted successfully"));
    } catch (error) {
        if (error instanceof HttpException) throw error;
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Failed to delete support ticket: ${error}`);
    }
}