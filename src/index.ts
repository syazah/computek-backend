import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config();
const app = express();

const port = process.env.PORT || 4444;
mongoose.connect(process.env.DB_URL || "").then(() => {
    console.log("Connected to MongoDB 🚀");
    app.listen(port, () => {
        console.log(`Server is running on port ${port} 🔥`);
    });
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});