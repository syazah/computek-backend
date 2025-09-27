export interface LayoutItem {
    orderId: string;
    width: number;
    height: number;
    quantity: number;
    canRotate: boolean;
}

export interface PlacedItem extends LayoutItem {
    x: number;
    y: number;
    rotation: number;
    actualWidth: number;
    actualHeight: number;
}