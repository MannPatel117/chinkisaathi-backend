import { Sequelize, DataTypes } from "sequelize";
import { initialSequelize } from "../utils/sql.js";
import { AccountsTransaction } from "./accountTransaction.model.js";
import { product } from "./product.model.js";

const sequelize = initialSequelize();

export const AccountsTransactionDetails = (await sequelize).define(
    "AccountsTransactionDetails",
    {
      transactionDetailID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true, // Auto-incrementing supplierID
       },
      accountTransaction:{
        type: DataTypes.INTEGER,
        references: {
          model: AccountsTransaction, // The referenced model
          key: "transactionID", // The primary key in the referenced model
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
      quantity:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      discountAmt:{
          type: DataTypes.FLOAT,
          allowNull: false,
      },
      amount:{
          type: DataTypes.FLOAT,
          allowNull: false,
      },
      wholeSalePrice:{
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
      tableName: "accountsTransactionsDetails",
      timestamps: true, // Enables createdAt and updatedAt
    }
  );