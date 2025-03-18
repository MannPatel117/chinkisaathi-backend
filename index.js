import app from "./api/app.js";
import { connectDB } from "./db/connection.js";
import colors from "colors";
import "./model/association.model.js";
import dotenv from "dotenv";

dotenv.config({ path: './.env' });

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

export default app;
