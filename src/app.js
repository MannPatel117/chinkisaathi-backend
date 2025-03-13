import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import morgan from "morgan";
import connectDB from "./db/connection.js";

const app = express()

app.use(morgan("dev"));

app.use(cors())
app.use(express.json({limit:"16kb"}))
app.use(cookieParser())

app.get("/", (req, res) => {
    res.status(200).send("Hello From Chinki");
});


//route imports
import adminUser from './routes/adminUser.routes.js'
import product from "./routes/product.routes.js";
import account from "./routes/account.routes.js"
import accountTransaction from "./routes/accountTransaction.routes.js"
import users from "./routes/users.routes.js"
import inventory from "./routes/inventory.routes.js"
import inventoryDetails from "./routes/inventoryDetails.routes.js"
import inventoryAccounts from "./routes/inventoryAccount.routes.js"
import offers from "./routes/offer.routes.js"
import bills from "./routes/bill.routes.js"

//routes
app.use("/api/v1/adminUser", adminUser)
app.use("/api/v1/products", product)
app.use("/api/v1/accounts", account)
app.use("/api/v1/accountTransaction", accountTransaction)
app.use("/api/v1/users", users)
app.use("/api/v1/inventorys", inventory)
app.use("/api/v1/inventoryDetails", inventoryDetails)
app.use("/api/v1/inventoryAccounts", inventoryAccounts)
app.use("/api/v1/offers", offers)
app.use("/api/v1/bills", bills)

export default app