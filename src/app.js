import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import morgan from "morgan";
import pool from "./db/connection.js";

const app = express()

app.use(morgan("dev"));

app.use(cors())
app.use(express.json({limit:"16kb"}))
app.use(cookieParser())

app.get("/", (req, res) => {
    res.status(200).send("Hello From Chinki");
});

// app.get("/api/v1/test-db", async (req, res) => {
//     try {
//         const [rows] = await pool.query("SELECT * From adminusers AS result");
//         res.status(200).json({ success: true, result: rows });
//     } catch (error) {
//         console.error("Database error:", error);
//         res.status(500).json({ success: false, error: error.message });
//     }
// });

export default app