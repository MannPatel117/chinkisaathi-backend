import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../db/connection.js"; 
import { Account } from "./account.model.js";
import { Inventory } from './inventory.model.js'


export const AccountsTransaction = sequelize.define(
    "AccountsTransaction",
    {
      transactionID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true, // Auto-incrementing supplierID
       },
      transactionType: {
        type: DataTypes.ENUM("sales", "purchase", "payment", "receipt"),
        defaultValue: "purchase",
        allowNull: false,
      },
      challanNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      challanDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      documentNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      supplier: {
        type: DataTypes.INTEGER,
        references: {
          model: Account, // The referenced model
          key: "supplierID", // The primary key in the referenced model
        },
        allowNull: false,
      },
      inventory:{
        type: DataTypes.INTEGER,
        references: {
          model: Inventory, // The referenced model
          key: "inventoryID", // The primary key in the referenced model
        },
        allowNull: false,
      },
      billNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      billDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      paymentType: {
        type: DataTypes.ENUM("Cash", "Online", "Cheque", "Other"),
        defaultValue: null,
        allowNull: true,
      },
      chequeNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      chequeDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      remark: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      finalAmt: {
        type: DataTypes.FLOAT, 
        allowNull: true,
      },
      actionBy:{
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "accountstransactions",
      timestamps: true, // Enables createdAt and updatedAt
    }
  );
  
