import type { ICostItem, IPageSize, IPaperConfig } from "../../validations/ProductValidations.js";

class OrderCost {
    private pageSizes: IPageSize[];
    private costItems: ICostItem[];
    private paperConfigs: IPaperConfig[]

    constructor(pageSizes: IPageSize[], costItems: ICostItem[], paperConfigs: IPaperConfig[]) {
        this.pageSizes = pageSizes;
        this.costItems = costItems;
        this.paperConfigs = paperConfigs;
    }

    private findBaseCost() {
 
    }
}
