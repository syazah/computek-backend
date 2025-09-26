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

    public validateImageDimensions = async (fileBuffer: Buffer, expectedWidth: number, expectedHeight: number, tolerance: number = 10): Promise<IImageValidations> => {
        try {
            const metadata = await sharp(fileBuffer).metadata();
            if (!metadata.width || !metadata.height) {
                throw new Error("Unable to retrieve image dimensions");
            }
            const widthDiff = Math.abs(metadata.width - expectedWidth);
            const heightDiff = Math.abs(metadata.height - expectedHeight);
            const isValidDimensions = widthDiff <= tolerance && heightDiff <= tolerance;
            return {
                isValid: isValidDimensions,
                actualDimensions: { width: metadata.width, height: metadata.height },
                expectedDimensions: { width: expectedWidth, height: expectedHeight },
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