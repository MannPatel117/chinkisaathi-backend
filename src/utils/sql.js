import { Sequelize } from "sequelize";
import { DB_CONFIG } from "../constant.js";

const initialSequelize = async() => {
    const sequelize = new Sequelize(
        DB_CONFIG.database,
        DB_CONFIG.user,
        DB_CONFIG.password,
        {
            host: DB_CONFIG.host,
            dialect: DB_CONFIG.dialect
        }
    );
    return sequelize;
}
    
export  {initialSequelize};