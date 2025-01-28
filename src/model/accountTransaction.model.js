import { Sequelize, DataTypes } from "sequelize";
import { initialSequelize } from "../utils/sql.js";
import { Account } from "./account.model.js";
//import inventory in future

const sequelize = initialSequelize();

export const AccountsTransaction = (await sequelize).define(
    "AccountsTransaction",
    {
      transactionID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true, // Auto-incrementing supplierID
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
      billNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      billDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      transactionType: {
        type: DataTypes.ENUM("Supply", "Payment"),
        defaultValue: "Supply",
        allowNull: false,
      },
      paymentType: {
        type: DataTypes.ENUM("Cash", "Online", "Cheque", "Other"),
        defaultValue: "Cash",
        allowNull: false,
      },
      chequeNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      chequeDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      finalAmt: {
        type: DataTypes.FLOAT, // Or DECIMAL if you need more precision
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
      },
    },
    {
      tableName: "accountsTransactions",
      timestamps: true, // Enables createdAt and updatedAt
    }
  );
  