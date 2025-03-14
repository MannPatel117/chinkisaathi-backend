import { Sequelize, DataTypes } from "sequelize";
import { initialSequelize } from "../utils/sql.js";
import { BillMaster } from "./bills.model.js";
import { User } from "./users.model.js";

const sequelize = initialSequelize();

export const RewardsPoint = (await sequelize).define(
  "RewardsPoint",
  {
    rewardID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    billID: {
      type: DataTypes.INTEGER,
      references: {
        model: BillMaster,
        key: "billID",
      },
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      references: {
        model: User,
        key: "phoneNumber",
      },
      allowNull: false,
    },
    pointsAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0, // Can be positive (earned) or negative (used)
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "rewardspoint",
    timestamps: false, // No updatedAt required
  }
);
