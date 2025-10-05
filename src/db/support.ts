import { Support } from "../schema/Support.js";
import type { CreateSupportInput } from "../validations/SupportValidations.js";

export class SupportClass {
    private static instance: SupportClass

    private constructor() {

    }

    public static getInstance(): SupportClass {
        if (!this.instance) {
            this.instance = new SupportClass();
        }
        return this.instance
    }

    public async createTicket(data: CreateSupportInput) {
        const ticket = await Support.create(data);
        if (!ticket) throw new Error("Failed to create support ticket");
        return ticket;
    }

    public async getAllTickets() {
        const tickets = await Support.find().populate('raisedBy', 'name username userType').populate('assignedTo', 'name username userType');
        return tickets;
    }

    public async getTicketById(id: string) {
        const ticket = await Support.findById(id).populate('raisedBy', 'name username userType').populate('assignedTo', 'name username userType');
        if (!ticket) throw new Error("Support ticket not found");
        return ticket;
    }

    public async updateTicketById(id: string, data: Partial<CreateSupportInput>) {
        const updatedTicket = await Support.findByIdAndUpdate(id, data, { new: true });
        if (!updatedTicket) throw new Error("Support ticket not found or not updated");
        return updatedTicket;
    }

    public async deleteTicketById(id: string) {
        const deletedTicket = await Support.findByIdAndDelete(id);
        if (!deletedTicket) throw new Error("Support ticket not found or not deleted");
        return deletedTicket;
    }
}