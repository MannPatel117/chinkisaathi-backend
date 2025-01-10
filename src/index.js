import app from "./app.js"
import dotenv from "dotenv";
import colors from "colors";
import morgan from "morgan";

dotenv.config({
    path: './.env'
})


const current_port = process.env.PORT || 8000
    app.listen(current_port, () =>{
        console.log(`Server is running at port : ${current_port}`.bgBlue.white);
})