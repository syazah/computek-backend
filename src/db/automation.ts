import { Automation } from "../schema/Automation.js";

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
}