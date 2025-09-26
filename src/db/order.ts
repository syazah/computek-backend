import { Order } from "../schema/Order.js";
import type { IOrder } from "../validations/OrderValidations.js";

export class OrderDB {
    private static instance: OrderDB;

    private constructor() { }

    public static getInstance(): OrderDB {
        if (!OrderDB.instance) {
            OrderDB.instance = new OrderDB();
        }
        return OrderDB.instance;
    }

    public async addOrder(data: IOrder, session?: any) {
        const order = new Order(data);
        const addedData = await order.save({ session });

        if (!addedData) {
            throw new Error("Order not added");
        }
        return addedData;
    }

    public async getOrderById(id: string) {
        const order = await Order.findById(id);
        if (!order) {
            throw new Error("Order not found");
        }
        return order;
    }

    public async getAllOrders() {
        const orders = await Order.find();
        if (!orders) {
            throw new Error("No orders found");
        }
        return orders;
    }

    public async updateOrder(id: string, data: Partial<IOrder>, session?: any) {
        const updatedOrder = await Order.findByIdAndUpdate(id, data, { new: true, session });
        if (!updatedOrder) {
            throw new Error("Order not found or not updated");
        }
        return updatedOrder;
    }
}