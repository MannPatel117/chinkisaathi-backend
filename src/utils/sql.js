import { Sequelize } from "sequelize";
import mysql from 'mysql2';
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



