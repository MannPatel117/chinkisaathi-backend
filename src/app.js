import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express()

app.use(morgan("dev"));

app.use(cors())
app.use(express.json({limit:"16kb"}))
app.use(cookieParser())

app.get("/", (req, res) => {
    res.status(200).send("Hello From Chinki");
});


export default app