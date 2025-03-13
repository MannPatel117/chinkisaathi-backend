import app from "./app.js"
import connectDB from "./db/connection.js";
import colors from 'colors';
import "./model/association.model.js";



connectDB().then(()=>{
    app.on("error",(error)=>{
        console.log(("Connection Failed", error).bgRed.white)
    })
    const current_port = process.env.PORT || 8000
    app.listen(current_port, () => {
        console.log(`Server is running at port : ${current_port}`.bgBlue.white);
    })
}).catch((err)=>{
    console.log(("Connection Failed", err).bgRed.white)
})