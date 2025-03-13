import { Sequelize, DataTypes } from "sequelize";
import { initialSequelize } from "../utils/sql.js";


const sequelize = initialSequelize();

export const Account = (await sequelize).define('Accounts',{
    supplierID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true, // Auto-incrementing supplierID
    },
    accountName: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    aliasName: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    phone_Number: {
        type: DataTypes.STRING(24),
        allowNull: false
    },
    addressLine1:{
        type: DataTypes.STRING(256),
        allowNull: true,
    },
    addressLine2:{
        type: DataTypes.STRING(256),
        allowNull: true,
    },
    city:{
        type: DataTypes.STRING(24),
        allowNull: true,
    },
    state:{
        type: DataTypes.STRING(24),
        allowNull: true, 
    },
    pincode:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    subGroup: {
        type: DataTypes.ENUM('Sundry Creditors', 'Sundry Debtors'),
        defaultValue: 'Sundry Creditors',
    },
    underGroup: {
        type: DataTypes.STRING(32),
    },
    paymentTerm: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    gstNumber: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING(128),
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
},{
    tableName: 'accounts',
    timestamps: true,   // Enables createdAt and updatedAt
    paranoid: true, 
});