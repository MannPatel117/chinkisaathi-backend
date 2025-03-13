import dotenv from "dotenv";
dotenv.config({ path: './.env' });
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
(async () => {
    const adminUser = (await import('./routes/adminUser.routes.js')).default;
    const product = (await import('./routes/product.routes.js')).default;
    const account = (await import('./routes/account.routes.js')).default;
    const accountTransaction = (await import('./routes/accountTransaction.routes.js')).default;
    const users = (await import('./routes/users.routes.js')).default;
    const inventory = (await import('./routes/inventory.routes.js')).default;
    const inventoryDetails = (await import('./routes/inventoryDetails.routes.js')).default;
    const inventoryAccounts = (await import('./routes/inventoryAccount.routes.js')).default;
    const offers = (await import('./routes/offer.routes.js')).default;
    const bills = (await import('./routes/bill.routes.js')).default;
  
    // Setup routes after dynamic imports
    app.use('/api/v1/adminUser', adminUser);
    app.use('/api/v1/products', product);
    app.use('/api/v1/accounts', account);
    app.use('/api/v1/accountTransaction', accountTransaction);
    app.use('/api/v1/users', users);
    app.use('/api/v1/inventorys', inventory);
    app.use('/api/v1/inventoryDetails', inventoryDetails);
    app.use('/api/v1/inventoryAccounts', inventoryAccounts);
    app.use('/api/v1/offers', offers);
    app.use('/api/v1/bills', bills);

  })();

export default app