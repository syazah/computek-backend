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

    // ...existing code...

    /* 
     * 1. Shelf (row-based) algorithm.
     *    Fast O(n) after sort. Suitable for similar-height items or when speed matters.
     */
    public optimizeLayoutWithShelfAlgorithm(
        items: LayoutItem[],
        sheetWidth: number,
        sheetHeight: number,
        bleedSize: number = 3,
        margins: { top: number; bottom: number; left: number; right: number; }
    ) {
        const workingWidth = sheetWidth - margins.left - margins.right;
        const workingHeight = sheetHeight - margins.top - margins.bottom;
        const expanded = this.expandItemsByQuantity(items)
            .sort((a, b) => b.height - a.height); // tallest-first for shelf stability

        const placed: PlacedItem[] = [];
        let shelfY = margins.bottom;
        let shelfHeight = 0;
        let cursorX = margins.left;

        for (const item of expanded) {
            const orientations = item.canRotate
                ? [
                    { w: item.width, h: item.height, r: 0 },
                    { w: item.height, h: item.width, r: 90 }
                ]
                : [{ w: item.width, h: item.height, r: 0 }];

            let placedFlag = false;
            for (const o of orientations) {
                const wWithBleed = o.w + bleedSize * 2;
                const hWithBleed = o.h + bleedSize * 2;

                // New shelf if width exceeded
                if (cursorX + wWithBleed > workingWidth) {
                    shelfY += shelfHeight;
                    cursorX = margins.left;
                    shelfHeight = 0;
                }
                // Check vertical space
                if (shelfY + hWithBleed > workingHeight) {
                    continue; // cannot fit this orientation, try next
                }

                // Place
                placed.push({
                    ...item,
                    x: cursorX + bleedSize,
                    y: shelfY + bleedSize,
                    rotation: o.r,
                    actualWidth: o.w,
                    actualHeight: o.h
                });

                cursorX += wWithBleed;
                shelfHeight = Math.max(shelfHeight, hWithBleed);
                placedFlag = true;
                break;
            }
            if (!placedFlag) {
                console.warn(`Shelf: Item ${item.orderId} not placed.`);
            }
        }

        const usedArea = placed.reduce((s, p) => s + p.actualWidth * p.actualHeight, 0);
        const efficiency = (usedArea / (workingWidth * workingHeight)) * 100;

        return {
            sheetDetails: { sheetWidth, sheetHeight },
            placedItems: placed,
            efficiency,
            unusedArea: (workingWidth * workingHeight) - usedArea
        };
    }

    /*
     * 2. MaxRects (simplified) algorithm.
     *    Higher packing efficiency for heterogeneous sizes. Slower than shelf.
     */
    public optimizeLayoutWithMaxRectsAlgorithm(
        items: LayoutItem[],
        sheetWidth: number,
        sheetHeight: number,
        bleedSize: number = 3,
        margins: { top: number; bottom: number; left: number; right: number; }
    ) {
        interface FreeRect { x: number; y: number; width: number; height: number; }

        const workingWidth = sheetWidth - margins.left - margins.right;
        const workingHeight = sheetHeight - margins.top - margins.bottom;
        const expanded = this.expandItemsByQuantity(items)
            .sort((a, b) => (b.width * b.height) - (a.width * a.height)); // big-first

        const freeRects: FreeRect[] = [{
            x: margins.left,
            y: margins.bottom,
            width: workingWidth - margins.left,
            height: workingHeight - margins.bottom
        }];
        const placed: PlacedItem[] = [];

        const fits = (fr: FreeRect, w: number, h: number) => w <= fr.width && h <= fr.height;

        const splitFreeRect = (fr: FreeRect, used: { x: number; y: number; width: number; height: number; }) => {
            const newRects: FreeRect[] = [];
            // Vertical split
            if (used.x > fr.x && used.x < fr.x + fr.width) {
                newRects.push({
                    x: fr.x,
                    y: fr.y,
                    width: used.x - fr.x,
                    height: fr.height
                });
            }
            if (used.x + used.width < fr.x + fr.width) {
                newRects.push({
                    x: used.x + used.width,
                    y: fr.y,
                    width: (fr.x + fr.width) - (used.x + used.width),
                    height: fr.height
                });
            }
            // Horizontal split
            if (used.y > fr.y && used.y < fr.y + fr.height) {
                newRects.push({
                    x: fr.x,
                    y: fr.y,
                    width: fr.width,
                    height: used.y - fr.y
                });
            }
            if (used.y + used.height < fr.y + fr.height) {
                newRects.push({
                    x: fr.x,
                    y: used.y + used.height,
                    width: fr.width,
                    height: (fr.y + fr.height) - (used.y + used.height)
                });
            }
            return newRects;
        };

        const prune = () => {
            for (let i = 0; i < freeRects.length; i++) {
                for (let j = i + 1; j < freeRects.length; j++) {
                    const A = freeRects[i];
                    const B = freeRects[j];
                    if (A &&
                        B &&
                        A.x >= B.x &&
                        A.y >= B.y &&
                        A.x + A.width <= B.x + B.width &&
                        A.y + A.height <= B.y + B.height) {
                        freeRects.splice(i, 1);
                        i--;
                        break;
                    }
                    if (B &&
                        A &&
                        B.x >= A.x &&
                        B.y >= A.y &&
                        B.x + B.width <= A.x + A.width &&
                        B.y + B.height <= A.y + A.height) {
                        freeRects.splice(j, 1);
                        j--;
                    }
                }
            }
        };

        for (const item of expanded) {
            const orientations = item.canRotate
                ? [
                    { w: item.width, h: item.height, r: 0 },
                    { w: item.height, h: item.width, r: 90 }
                ]
                : [{ w: item.width, h: item.height, r: 0 }];

            let bestIndex = -1;
            let bestScore = Number.POSITIVE_INFINITY;
            let bestOrientation: { w: number; h: number; r: number } | null = null;

            for (let i = 0; i < freeRects.length; i++) {
                const fr = freeRects[i];
                if (!fr) continue;
                for (const o of orientations) {
                    const wB = o.w + bleedSize * 2;
                    const hB = o.h + bleedSize * 2;
                    if (fits(fr, wB, hB)) {
                        // Heuristic: area fit
                        const waste = (fr.width * fr.height) - (wB * hB);
                        if (waste < bestScore) {
                            bestScore = waste;
                            bestIndex = i;
                            bestOrientation = o;
                        }
                    }
                }
            }

            if (bestIndex === -1 || !bestOrientation) {
                console.warn(`MaxRects: Item ${item.orderId} not placed.`);
                continue;
            }

            const target = freeRects[bestIndex];
            if (!target) throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error in MaxRects algorithm. Cannot get target rectangle.");
            const usedRect = {
                x: target.x,
                y: target.y,
                width: bestOrientation.w + bleedSize * 2,
                height: bestOrientation.h + bleedSize * 2
            };

            placed.push({
                ...item,
                x: usedRect.x + bleedSize,
                y: usedRect.y + bleedSize,
                rotation: bestOrientation.r,
                actualWidth: bestOrientation.w,
                actualHeight: bestOrientation.h
            });

            // Remove target rect and split
            freeRects.splice(bestIndex, 1);
            const splits = splitFreeRect(target, usedRect);
            freeRects.push(...splits);
            prune();
        }

        const usedArea = placed.reduce((s, p) => s + p.actualWidth * p.actualHeight, 0);
        const efficiency = (usedArea / ((sheetWidth - margins.left - margins.right) * (sheetHeight - margins.top - margins.bottom))) * 100;

        return {
            sheetDetails: { sheetWidth, sheetHeight },
            placedItems: placed,
            efficiency,
            unusedArea: ((sheetWidth - margins.left - margins.right) * (sheetHeight - margins.top - margins.bottom)) - usedArea
        };
    }

    /*
     * 3. Gang jobs algorithm.
     *    Interleaves groups (orders) to balance sheet usage across multiple jobs.
     *    Options:
     *      groupBy: function to group items (e.g., substrate, color profile). Default: orderId.
     *      priority: custom comparator to prioritize groups or items (e.g., due date).
     */
    public optimizeLayoutForGangJobs(
        items: LayoutItem[],
        sheetWidth: number,
        sheetHeight: number,
        options: {
            bleedSize?: number;
            margins: { top: number; bottom: number; left: number; right: number; };
            groupBy?: (item: LayoutItem) => string;
            priority?: (a: LayoutItem, b: LayoutItem) => number;
            strategy?: 'bottomLeft' | 'shelf';
        }
    ) {
        const {
            bleedSize = 3,
            margins,
            groupBy = (i: LayoutItem) => String(i.orderId),
            priority,
            strategy = 'bottomLeft'
        } = options;

        const expanded = this.expandItemsByQuantity(items);

        if (priority) {
            expanded.sort(priority);
        } else {
            expanded.sort((a, b) => (b.width * b.height) - (a.width * a.height));
        }

        // Group items
        const groupsMap = new Map<string, LayoutItem[]>();
        for (const it of expanded) {
            const key = groupBy(it);
            if (!groupsMap.has(key)) groupsMap.set(key, []);
            groupsMap.get(key)!.push(it);
        }

        // Round-robin across groups
        const groupQueues = [...groupsMap.values()].map(g => [...g]);
        const interleaved: LayoutItem[] = [];
        while (groupQueues.some(q => q.length)) {
            for (const q of groupQueues) {
                if (q.length) interleaved.push(q.shift()!);
            }
        }

        // Use chosen base strategy
        if (strategy === 'shelf') {
            return this.optimizeLayoutWithShelfAlgorithm(interleaved, sheetWidth, sheetHeight, bleedSize, margins);
        }

        // Default: bottom-left using existing helper
        const workingWidth = sheetWidth - margins.left - margins.right;
        const workingHeight = sheetHeight - margins.top - margins.bottom;

        const placed: PlacedItem[] = [];
        const occupied: { x: number; y: number; width: number; height: number; }[] = [];

        for (const item of interleaved) {
            const placement = this.findBestPlacement(item, workingWidth, workingHeight, occupied, bleedSize, margins);
            if (placement) {
                placed.push(placement);
                occupied.push({
                    x: placement.x - bleedSize,
                    y: placement.y - bleedSize,
                    width: placement.actualWidth + bleedSize * 2,
                    height: placement.actualHeight + bleedSize * 2
                });
            } else {
                console.warn(`Gang: Item ${item.orderId} not placed.`);
            }
        }

        const usedArea = placed.reduce((s, p) => s + p.actualWidth * p.actualHeight, 0);
        const efficiency = (usedArea / (workingWidth * workingHeight)) * 100;

        return {
            sheetDetails: { sheetWidth, sheetHeight },
            placedItems: placed,
            efficiency,
            unusedArea: (workingWidth * workingHeight) - usedArea,
            meta: {
                groups: groupsMap.size,
                strategy
            }
        };
    }
}