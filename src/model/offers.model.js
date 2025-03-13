import { Sequelize, DataTypes } from "sequelize";
import { initialSequelize } from "../utils/sql.js";
import { product } from "./product.model.js";

const sequelize = initialSequelize();

export const Offer = (await sequelize).define(
  "Offer",
  {
    offerID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    offerName:{
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    offerType: {
      type: DataTypes.ENUM("free_product", "flat_discount"),
      allowNull: false,
    },
    minOrderValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    discountPerc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    inventory: {
        type: DataTypes.JSON,  // Store array as JSON
        allowNull: false,
    },
    isActive:{
          type: DataTypes.BOOLEAN,
          allowNull: false,
    },
    isCoupon:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false
    },
    freeProductID: {
      type: DataTypes.INTEGER,
      references: {
        model: product, // The referenced Product table
        key: "productID",
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
    tableName: "offers",
    timestamps: true,
  }
);
