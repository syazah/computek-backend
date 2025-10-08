import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import routes from "./routes.js";
import { globalErrorHandler } from "./services/responses/globalErrorHandler.js";
import cors from "cors"

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4444;

app.use("/api", routes)
app.use("/healthCheck", (req, res) => {
    res.status(200).send({
        status: "OK",
        message: `Server is healthy and running 🚀 on port ${port}, version is 1.0.1`,
    });
});

app.use(globalErrorHandler)

mongoose.connect(process.env.DB_URL || "").then(() => {
    console.log("Connected to MongoDB 🚀");
    app.listen(port, () => {
        console.log(`Server is running on port ${port} 🔥`);
    });
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});