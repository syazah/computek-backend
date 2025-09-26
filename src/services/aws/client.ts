import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv"
dotenv.config();
export class AWSHelper {
    private s3: S3Client;
    private static instance: AWSHelper;

    private constructor() {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION || "ap-south-1",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.AWS_SECRET_KEY || "",
            },
        });
    }

    public static getInstance(): AWSHelper {
        if (!AWSHelper.instance) {
            AWSHelper.instance = new AWSHelper();
        }
        return AWSHelper.instance;
    }

    public async uploadFile(fileName: string, fileContent: Buffer, mimeType: string, bucketName: string): Promise<string> {
        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: fileContent,
            ContentType: mimeType,
        };
        const upload = new Upload({ client: this.s3, params })
        try {
            const data = await upload.done();
            if (!data.Location) {
                console.log("File upload failed in aws -- upload file")
                throw new Error(`File upload failed, while uploading ${fileName} to S3`);
            }
            return data.Location;
        } catch (error) {
            throw new Error(`File upload failed: ${error} `);
        }
    }

    public async deleteFile(fileName: string, bucketName: string): Promise<void> {
        try {
            const params = {
                Bucket: bucketName,
                Key: fileName,
            };

            await this.s3.send(new DeleteObjectCommand(params));
        } catch (error) {
            console.error(`File deletion failed for ${fileName}:`, error);
            throw new Error(`File deletion failed: ${error}`);
        }
    }
}