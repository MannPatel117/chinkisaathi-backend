import { Sequelize, DataTypes } from "sequelize";
import { initialSequelize } from "../utils/sql.js";

const sequelize = initialSequelize();

export const User = (await sequelize).define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
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
    rewardPoint: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    customerType:{
      type: DataTypes.ENUM('new', 'existing', 'facebook', 'chinki-van'),
      defaultValue: 'new',
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
    tableName: "users",
    timestamps: true, // Includes createdAt and updatedAt fields
  }
);

// Export the model
export default User;
