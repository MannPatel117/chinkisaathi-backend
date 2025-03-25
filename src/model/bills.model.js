import { Sequelize, DataTypes } from "sequelize";
import { initialSequelize } from "../utils/sql.js";
import { Inventory } from "../model/inventory.model.js"
import { User } from "../model/users.model.js";
import { Offer } from "./offers.model.js";
import { Account } from "./account.model.js";
import { Coupon } from "./coupons.model.js";
const sequelize = initialSequelize();


export const BillMaster = (await sequelize).define(
    "BillMaster",
    {
      billID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true, // Auto-incrementing supplierID
       },
      inventoryID:{
        type: DataTypes.INTEGER,
        references: {
          model: Inventory, // The referenced model
          key: "inventoryID", // The primary key in the referenced model
        },
        allowNull: false,
      },
      phoneNumber:{
        type: DataTypes.INTEGER,
        references: {
          model: User, // The referenced model
          key: "phoneNumber", // The primary key in the referenced model
        },
        allowNull: true,
      },
      supplier:{
        type: DataTypes.INTEGER,
        references: {
          model: Account, // The referenced model
          key: "supplierID", // The primary key in the referenced model
        },
        allowNull: true,
      },
      invoiceNumber:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      billNumber:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerType: {
        type: DataTypes.ENUM('new', 'existing', 'facebook', 'chinki-van', 'new-facebook', 'unknown'),
        defaultValue: 'unknown',
      },
      paymentType: {
        type: DataTypes.ENUM('cash', 'online', 'others'),
        defaultValue: 'cash',
      },
      finalAmount:{
          type: DataTypes.FLOAT,
          allowNull: false,
      },
      finalAmountF:{
        type: DataTypes.FLOAT,
        allowNull: false,
    },
      rewardPointsUsed:{
          type: DataTypes.FLOAT,
          allowNull: false,
      },
      offerID:{
        type: DataTypes.INTEGER,
        references: {
          model: Offer, // The referenced model
          key: "offerID", // The primary key in the referenced model
        },
        allowNull: true,
      },
      couponID:{
        type: DataTypes.STRING,
        references: {
          model: Coupon, // The referenced model
          key: "couponID", // The primary key in the referenced model
        },
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
      tableName: "billmaster",
      timestamps: true, // Enables createdAt and updatedAt
    }
  );