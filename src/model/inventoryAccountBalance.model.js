import { Sequelize, DataTypes } from "sequelize";
import { initialSequelize } from "../utils/sql.js";
import { Inventory } from "./inventory.model.js";
import { Account } from "./account.model.js";

const sequelize = initialSequelize();

export const InventoryAccountBalance = (await sequelize).define("InventoryAccountBalance", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
    },
    inventoryID: {
        type: DataTypes.INTEGER,
        references: {
            model: Inventory,
            key: "inventoryID",
        },
        allowNull: false,
    },
    accountID: {
        type: DataTypes.INTEGER,
        references: {
            model: Account,
            key: "supplierID",
        },
        allowNull: false,
    },
    openingBalance: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    closingBalance: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
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
    }
}, {
    tableName: "inventoryaccountbalance",  // Ensure the correct table name
    timestamps: true,
});


// Export the model
export default InventoryAccountBalance;