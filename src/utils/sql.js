import { Sequelize } from "sequelize";
const initialSequelize = async() => {
   
    console.log(process.env.DATABASE)
    console.log(process.env.USER)
    console.log(process.env.PASSWORD)
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



