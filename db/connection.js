import { Sequelize } from "sequelize";
import dotenv from 'dotenv'; // For ESM support
dotenv.config();
// Create a Sequelize instance
console.log(process.env.DATABASE)
console.log(process.env.USER)
console.log(process.env.PASSWORD)
console.log(process.env.HOST)
const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USER,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    dialect: "mysql",
    dialectOptions: {
      connectTimeout: 60000,  // 60 seconds timeout
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,  // 60 seconds
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate(); // authenticate the connection
    console.log(`\nConnection to MySQL Successful at host - ${process.env.HOST}`.bgGreen.white);
  } catch (error) {
    console.error(("MySQL Connection Failed:", error.message).bgRed.white);
    process.exit(1); // Exit the process with failure
  }
};

export { sequelize, connectDB }; // Export sequelize to be used elsewhere
