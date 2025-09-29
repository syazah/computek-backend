export interface IImageValidations {
    actualDimensions: { width: number; height: number };
    metadata: {
        format?: string;
        size?: number;
        density?: number;
        channels?: number;
        hasAlpha?: boolean;
    };
}