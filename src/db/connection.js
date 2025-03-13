import { initialSequelize } from "../utils/sql.js";
/*
const connectDB = async () => {
    try {
        const pool = mysql.createPool(DB_CONFIG); // Create a pool
        const connection = await pool.getConnection(); // Get a connection instance
        console.log((`\nConnection to MySQL Successful at host - ${DB_CONFIG.host}`).bgGreen.white);
        connection.release(); // Release the connection back to the pool
        return pool; // Return the pool for further use
    } catch (error) {
        console.error(("MySQL Connection Failed:", error.message).bgRed.white);
        process.exit(1); // Exit the process with failure
    }
};
*/

const connectDB = async () =>{
    try{
        const sequelize= initialSequelize();
        (await sequelize).authenticate();
        console.log((`\nConnection to MySQL Successful at host - ${process.env.HOST}`).bgGreen.white);
        return true;
    } catch(error){
        console.error(("MySQL Connection Failed:", error.message).bgRed.white);
        process.exit(1); // Exit the process with failure
    }
    
}
export default connectDB;