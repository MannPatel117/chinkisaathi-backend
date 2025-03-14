import { Sequelize } from "sequelize";
import mysql from 'mysql2';
const initialSequelize = async() => {
    const sequelize = new Sequelize(
        process.env.DATABASE,
        process.env.USER,
        process.env.PASSWORD,
        {
            host: process.env.HOST,
            dialect: 'mysql',
            dialectOptions: {
                connectTimeout: 60000  // 60 seconds timeout
            },
            pool: {
                max: 5,
                min: 0,
                acquire: 60000,  // 60 seconds
                idle: 10000
            }
        }
    );
    return sequelize;
}
    
export  {initialSequelize};



