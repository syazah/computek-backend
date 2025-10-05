import { Router } from "express";
import { createSupportTicket, deleteSupportTicketById, getAllSupportTickets, getSupportTicketById, updateSupportTicketById } from "../controllers/support.js";

const supportRouter = Router()

supportRouter.route("/").post(createSupportTicket).get(getAllSupportTickets)
supportRouter.route("/:id").get(getSupportTicketById).patch(updateSupportTicketById).delete(deleteSupportTicketById)

export default supportRouter