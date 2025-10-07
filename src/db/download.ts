import { Download } from "../schema/Download.js";

export class DownloadDB {
    private static instance: DownloadDB;

    private constructor() { }

    public static getInstance(): DownloadDB {
        if (!DownloadDB.instance) {
            DownloadDB.instance = new DownloadDB();
        }
        return DownloadDB.instance;
    }

    public async createDownload(data: any) {
        const download = new Download(data);
        return await download.save();
    }

    public async getAllDownloads() {
        return await Download.find().sort({ createdAt: -1 });
    }

    public async getDownloadById(id: string) {
        return await Download.findById(id);
    }
}