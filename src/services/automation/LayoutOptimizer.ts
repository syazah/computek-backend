import { HttpStatus } from "http-status-ts";
import type { LayoutItem, PlacedItem } from "../../validations/LayoutValidations.js";
import { HttpException } from "../responses/HttpException.js";

export class LayoutOptimizer {
    private static instance: LayoutOptimizer;
    private constructor() { }

    private expandItemsByQuantity(items: LayoutItem[]): LayoutItem[] {
        const expanded: LayoutItem[] = [];
        items.forEach(item => {
            for (let i = 0; i < item.quantity; i++) {
                expanded.push({ ...item, quantity: 1 });
            }
        });
        return expanded;
    }
    private hasOverlap(
        x: number,
        y: number,
        width: number,
        height: number,
        occupiedSpaces: { x: number, y: number, width: number, height: number }[]
    ): boolean {
        return occupiedSpaces.some(space =>
            x < space.x + space.width &&
            x + width > space.x &&
            y < space.y + space.height &&
            y + height > space.y
        );
    }

    private findBestPlacement(item: LayoutItem,
        maxWidth: number,
        maxHeight: number,
        occupiedSpaces: { x: number, y: number, width: number, height: number }[],
        bleedSize: number,
        margins: { top: number, bottom: number, left: number, right: number }) {
        const orientations = item.canRotate ? [
            { width: item.width, height: item.height, rotation: 0 },
            { width: item.height, height: item.width, rotation: 90 }
        ] : [{ width: item.width, height: item.height, rotation: 0 }];

        for (const orientation of orientations) {
            const itemWithBleed = {
                width: orientation.width + bleedSize * 2,
                height: orientation.height + bleedSize * 2
            };
            if (itemWithBleed.width > maxWidth || itemWithBleed.height > maxHeight) {
                continue;
            }
            for (let y = margins.bottom; y <= maxHeight - itemWithBleed.height; y += 1) {
                for (let x = margins.left; x <= maxWidth - itemWithBleed.width; x += 1) {
                    if (!this.hasOverlap(x, y, itemWithBleed.width, itemWithBleed.height, occupiedSpaces)) {
                        return {
                            ...item,
                            x: x + bleedSize,
                            y: y + bleedSize,
                            rotation: orientation.rotation,
                            actualWidth: orientation.width,
                            actualHeight: orientation.height
                        };
                    }
                }
            }
        }
        return null
    }

    public static getInstance(): LayoutOptimizer {
        if (!LayoutOptimizer.instance) {
            LayoutOptimizer.instance = new LayoutOptimizer();
        }
        return LayoutOptimizer.instance;
    }

    public optimizeLayoutWithBottomLeftFillAlgorithm(
        items: LayoutItem[],
        sheetWidth: number,
        sheetHeight: number,
        bleedSize: number = 3,
        margins: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        }
    ) {
        const workingWidth = sheetWidth - margins.left - margins.right;
        const workingHeight = sheetHeight - margins.top - margins.bottom;
        const expandedItems = this.expandItemsByQuantity(items);

        expandedItems.sort((a, b) => (b.width * b.height) - (a.width * a.height));

        const placedItems: PlacedItem[] = [];
        const occupiedSpaces: { x: number, y: number, width: number, height: number }[] = [];

        for (const item of expandedItems) {
            const placement = this.findBestPlacement(item, workingWidth, workingHeight, occupiedSpaces, bleedSize, margins);
            if (placement) {
                placedItems.push(placement);
                occupiedSpaces.push({
                    x: placement.x - bleedSize,
                    y: placement.y - bleedSize,
                    width: placement.actualWidth + bleedSize * 2,
                    height: placement.actualHeight + bleedSize * 2
                });
            } else {
                console.warn(`Item ${item.orderId} could not be placed on the sheet.`);
            }
        }
        const totalUsedArea = placedItems.reduce(
            (sum, item) => sum + (item.actualWidth * item.actualHeight), 0
        );
        const efficiency = (totalUsedArea / (workingWidth * workingHeight)) * 100;

        return {
            sheetDetails: {
                sheetWidth,
                sheetHeight,
            },
            placedItems,
            efficiency,
            unusedArea: (workingWidth * workingHeight) - totalUsedArea
        };
    }

    public optimizeLayoutWithGridAlgorithm(
        items: LayoutItem[],
        sheetWidth: number,
        sheetHeight: number,
        bleedSize: number = 3,
        margins: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        }
    ) {
        try {
            const workingWidth = sheetWidth - margins.left - margins.right;
            const workingHeight = sheetHeight - margins.top - margins.bottom;
            const expandedItems = this.expandItemsByQuantity(items);

            const placedItems: PlacedItem[] = [];
            let currentX = margins.left;
            let currentY = margins.bottom;
            let rowHeight = 0;

            for (const item of expandedItems) {
                const itemWidthWithBleed = item.width + bleedSize * 2;
                const itemHeightWithBleed = item.height + bleedSize * 2;

                if (itemWidthWithBleed > workingWidth || itemHeightWithBleed > workingHeight) {
                    console.warn(`Item ${item.orderId} is too large to fit on the sheet.`);
                    continue;
                }

                if (currentX + itemWidthWithBleed > sheetWidth - margins.right) {
                    currentX = margins.left;
                    currentY += rowHeight;
                    rowHeight = 0;
                }

                if (currentY + itemHeightWithBleed > sheetHeight - margins.top) {
                    console.warn(`No more space to place item ${item.orderId} on the sheet.`);
                    break;
                }

                placedItems.push({
                    ...item,
                    x: currentX + bleedSize,
                    y: currentY + bleedSize,
                    rotation: 0,
                    actualWidth: item.width,
                    actualHeight: item.height
                });

                currentX += itemWidthWithBleed;
                rowHeight = Math.max(rowHeight, itemHeightWithBleed);
            }

            const totalUsedArea = placedItems.reduce(
                (sum, item) => sum + (item.actualWidth * item.actualHeight), 0
            );
            const efficiency = (totalUsedArea / (workingWidth * workingHeight)) * 100;
            return {
                sheetDetails: {
                    sheetWidth,
                    sheetHeight,
                },
                placedItems,
                efficiency,
                unusedArea: (workingWidth * workingHeight) - totalUsedArea
            };
        } catch (error) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Error optimizing layout with grid algorithm');
        }
    }
}