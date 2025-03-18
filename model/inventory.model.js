import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../db/connection.js"; 


export const Inventory = sequelize.define(
  "Inventory",
  {
    inventoryID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true, // Auto-incrementing supplierID
    },
    inventoryNameAbbri: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inventoryName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addressLine1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addressLine2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addressLine3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    billNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "a-0",
    },
    invoiceNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    paymentVoucherDocNo: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "PV-001",
    },
    receiptVoucherDocNo: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "RV-001",
    },
    goodsReceiptDocNo: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "GR-001",
    },
    bankAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    cashAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    otherAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    phoneNumber:{
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    tableName: "inventory",
    timestamps: true, // Includes createdAt and updatedAt fields
    paranoid: true,
  }
);

// Export the model
export default Inventory;