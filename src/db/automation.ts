import { Automation, ManualAutomation } from "../schema/Automation.js";
import type { ManualAutomationRequest } from "../validations/AutomationValidation.js";

export class AutomationDB {
    private static instance: AutomationDB
    private constructor() { }

    public static getInstance(): AutomationDB {
        if (!AutomationDB.instance) {
            AutomationDB.instance = new AutomationDB();
        }
        return AutomationDB.instance;
    }

    public async createAutomation(data: any) {
        const automation = new Automation(data);
        return await automation.save();
    }

    public async getAutomationById(id: string) {
        return await Automation.findById(id).populate('orders');
    }

    public async getAllAutomations() {
        return await Automation.find().populate('orders');
    }

    public async deleteAutomation(_id: string) {
        return await Automation.findByIdAndDelete(_id);
    }

    public async createManualAutomation(data: ManualAutomationRequest) {
        const manualAutomation = new ManualAutomation(data);
        return await manualAutomation.save();
    }
    public async getManualAutomationById(id: string) {
        return await ManualAutomation.findById(id).populate('orders');
    }

    public async getAllManualAutomations() {
        return await ManualAutomation.find().populate('orders');
    }
    public async deleteManualAutomation(_id: string) {
        return await ManualAutomation.findByIdAndDelete(_id);
    }
}