import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../db/connection.js"; 
import { Offer } from "./offers.model.js";


export const Coupon = sequelize.define(
  "Coupon",
  {
    couponID: {
      type: DataTypes.STRING(7),
      primaryKey: true,
      unique: true,
    },
    offerID: {
      type: DataTypes.INTEGER,
      references: {
        model: Offer,
        key: "offerID",
      },
      allowNull: false,
    },
    isRedeemed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: "coupons",
    timestamps: true,
  }
);
