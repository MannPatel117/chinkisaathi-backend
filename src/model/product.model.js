import { Sequelize, DataTypes } from "sequelize";
import { initialSequelize } from "../utils/sql.js";

const sequelize = initialSequelize();

export const product = (await sequelize).define('MasterProducts',{
    productID:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true, // Auto-incrementing supplierID
    },
    productName:{
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    aliasName:{
        type: DataTypes.STRING(64),
        allowNull: false, 
    },
    barcode:{
        type: DataTypes.STRING(48),
        allowNull: false,
        unique: true,  
    },
    productType:{
        type: DataTypes.ENUM('finished', 'estimated'),
        defaultValue: 'finished',
    },
    img:{
        type: DataTypes.STRING(256),
        allowNull: true, 
    },
    mrp:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    discount:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    sellingPrice:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    wholeSalePrice:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    gst:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    hsnCode:{
        type: DataTypes.STRING(24),
        allowNull: true, 
    },
    category:{
        type: DataTypes.STRING(24),
        allowNull: true, 
    },
    status:{
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    },{
        tableName: 'masterProduct',
        timestamps: true,   // Enables createdAt and updatedAt
        paranoid: true, 
    });