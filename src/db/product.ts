import type { Model } from "mongoose"
export class ProductDB {
    private static instance: ProductDB
    private constructor() { }

    public static getInstance(): ProductDB {
        if (!ProductDB.instance) {
            ProductDB.instance = new ProductDB()
        }
        return ProductDB.instance
    }

    // Generic CRUD operations
    public async create<T>(model: Model<T>, data: T): Promise<T> {
        const created = await model.create(data)
        if (!created) {
            throw new Error(`Failed to create ${model.modelName}`)
        }
        return created
    }

    public async getAll<T>(model: Model<T>): Promise<T[]> {
        return await model.find()
    }

    public async getById<T>(model: Model<T>, id: string): Promise<T | null> {
        return await model.findOne({ _id: id })
    }

    public async deleteById<T>(model: Model<T>, id: string): Promise<T | null> {
        return await model.findOneAndDelete({ _id: id })
    }

    public async updateById<T>(model: Model<T>, id: string, updatedData: Partial<T>): Promise<T | null> {
        return await model.findOneAndUpdate(
            { _id: id },
            { $set: updatedData },
            { new: true }
        )
    }
}