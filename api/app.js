import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import serverless from "serverless-http";

// Import routes
import adminUser from "./adminUser.js";
import product from "./product.js";
import account from "./account.js";
import accountTransaction from "./accountTransaction.js";
import users from "./users.js";
import inventory from "./inventory.js";
import inventoryDetails from "./inventoryDetails.js";
import inventoryAccounts from "./inventoryAccount.js";
import offers from "./offer.js";
import bills from "./bill.js";
import dotenv from "dotenv";

dotenv.config({ path: './.env' });
// Initialize Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: [
      "X-CSRF-Token",
      "X-Requested-With",
      "Accept",
      "Accept-Version",
      "Content-Length",
      "Content-MD5",
      "Content-Type",
      "Date",
      "X-Api-Version",
    ],
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// Setup routes
app.use('/api/adminUser', adminUser);
app.use('/api/products', product);
app.use('/api/accounts', account);
app.use('/api/accountTransaction', accountTransaction);
app.use('/api/users', users);
app.use('/api/inventorys', inventory);
app.use('/api/inventoryDetails', inventoryDetails);
app.use('/api/inventoryAccounts', inventoryAccounts);
app.use('/api/offers', offers);
app.use('/api/bills', bills);

// Root route
app.get("/", (req, res) => {
  res.status(200).send("Hello From Chinki");
});


import { connectDB } from "../db/connection.js";
import colors from "colors";
import "../model/association.model.js";


// Connect to DB only once
connectDB()
  .then(() => {
    console.log("Database connection successful!".bgGreen.white);

    // Optional: Handle app-level errors
    app.on("error", (error) => {
      console.log(`Server Error: ${error}`.bgRed.white);
    });
  })
  .catch((err) => {
    console.log(`Connection Failed: ${err}`.bgRed.white);
  });

export default serverless(app);