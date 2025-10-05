import { HttpStatus } from "http-status-ts";
import { SupportClass } from "../db/support.js";
import { HttpException } from "../services/responses/HttpException.js";
import { successResponse } from "../services/responses/successResponse.js";

const supportDB = SupportClass.getInstance();

export const createSupportTicket = async (req: any, res: any) => {
    try {
        const data = req.body;
        data.raisedBy = req.user._id;
        const ticket = await supportDB.createTicket(data);
        res.status(HttpStatus.CREATED).json(successResponse(ticket, "Support ticket created successfully"));
    } catch (error) {
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
        const ticket = await supportDB.getTicketById(id);
        res.status(HttpStatus.OK).json(successResponse(ticket, "Support ticket fetched successfully"));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Failed to fetch support ticket: ${error}`);
    }
}

export const updateSupportTicketById = async (req: any, res: any) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const updatedTicket = await supportDB.updateTicketById(id, data);
        res.status(HttpStatus.OK).json(successResponse(updatedTicket, "Support ticket updated successfully"));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Failed to update support ticket: ${error}`);
    }
}

export const deleteSupportTicketById = async (req: any, res: any) => {
    try {
        const id = req.params.id;
        const deletedTicket = await supportDB.deleteTicketById(id);
        res.status(HttpStatus.OK).json(successResponse(deletedTicket, "Support ticket deleted successfully"));
    } catch (error) {
        throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, `Failed to delete support ticket: ${error}`);
    }
}