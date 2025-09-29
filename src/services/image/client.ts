import sharp from "sharp";
import type { IImageValidations } from "../../validations/ImageServiceValidations.js";

export class ImageManager {
    private static instance: ImageManager;
    private constructor() { }

    public static getInstance(): ImageManager {
        if (!ImageManager.instance) {
            ImageManager.instance = new ImageManager();
        }
        return ImageManager.instance;
    }

    public getImageDimensions = async (fileBuffer: Buffer, tolerance: number = 10): Promise<IImageValidations> => {
        try {
            const metadata = await sharp(fileBuffer).metadata();
            if (!metadata.width || !metadata.height) {
                throw new Error("Unable to retrieve image dimensions");
            }
            return {
                actualDimensions: { width: metadata.width, height: metadata.height },
                metadata: {
                    format: metadata.format || undefined,
                    size: metadata.size || -1,
                    density: metadata.density || -1,
                    channels: metadata.channels || -1,
                    hasAlpha: metadata.hasAlpha || false
                }
            };
        } catch (error) {
            throw new Error(`Image validation failed: ${error}`);
        }
    }
}