export interface IImageValidations {
    isValid: boolean;
    actualDimensions: { width: number; height: number };
    expectedDimensions: { width: number; height: number };
    metadata: {
        format?: string;
        size?: number;
        density?: number;
        channels?: number;
        hasAlpha?: boolean;
    };
}