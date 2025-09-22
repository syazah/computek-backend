import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import routes from "./routes.js";
import { globalErrorHandler } from "./services/ErrorHandling/globalErrorHandler.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api", routes)

app.use(globalErrorHandler)
const port = process.env.PORT || 4444;
mongoose.connect(process.env.DB_URL || "").then(() => {
    console.log("Connected to MongoDB 🚀");
    app.listen(port, () => {
        console.log(`Server is running on port ${port} 🔥`);
    });
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});