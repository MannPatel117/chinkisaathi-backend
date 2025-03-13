import { Sequelize } from "sequelize";
import dotenv from "dotenv";
const initialSequelize = async() => {
    const sequelize = new Sequelize(
        process.env.DATABASE,
        process.env.USER,
        process.env.PASSWORD,
        {
            host: process.env.HOST,
            dialect: 'mysql'
        }
    );
    return sequelize;
}
    
export  {initialSequelize};



