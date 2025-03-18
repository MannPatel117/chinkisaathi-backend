import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../db/connection.js"; 
import { BillMaster } from "./bills.model.js";
import { product } from "./product.model.js";


export const billTransactionDetails = sequelize.define(
    "billTransactionDetails",
    {
      billTransactionDetailID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true, // Auto-incrementing supplierID
       },
      billID:{
        type: DataTypes.INTEGER,
        references: {
          model: BillMaster, // The referenced model
          key: "billID", // The primary key in the referenced model
        },
        allowNull: false,
      },
      productID:{
        type: DataTypes.INTEGER,
        references: {
          model: product, // The referenced model
          key: "productID", // The primary key in the referenced model
        },
        allowNull: false,
      },
      productName:{
        type: DataTypes.STRING(128),
          allowNull: false,
      },
      productType:{
        type: DataTypes.ENUM('finished', 'estimated'),
        defaultValue: 'finished',
     },
      quantity:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mrp:{
        type: DataTypes.FLOAT,
        allowNull: false,
     },
      discountPerc:{
          type: DataTypes.FLOAT,
          allowNull: false,
      },
      rate:{
          type: DataTypes.FLOAT,
          allowNull: false,
      },
      amount:{
        type: DataTypes.FLOAT,
        allowNull: false,
     },
     gstPerc:{
        type: DataTypes.FLOAT,
        allowNull: false,
     },
      cgstAmount:{
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      sgstAmount:{
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      igstAmount:{
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      netAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    },
    {
      tableName: "billtransactiondetails",
      timestamps: true, // Enables createdAt and updatedAt
    }
  );