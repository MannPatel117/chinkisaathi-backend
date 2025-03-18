import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../db/connection.js"; 
import { Inventory } from './inventory.model.js';
import { product } from './product.model.js';
import { AccountsTransaction } from './accountTransaction.model.js';
import { BillMaster } from './bills.model.js'

export const InventoryTransaction = sequelize.define('InventoryTransaction', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true, 
    },
    inventoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Inventory,
            key: 'inventoryID'
        },
        onDelete: 'CASCADE'
    },
    productID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: product,
            key: 'productID'
        },
        onDelete: 'CASCADE'
    },
    accountTransactionID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: AccountsTransaction, // change
            key: 'transactionID'
        },
        onDelete: 'CASCADE'
    },
    billID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: BillMaster, // change
            key: 'billID'
        },
        onDelete: 'CASCADE'
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    type: {
        type: DataTypes.ENUM('add', 'subtract', 'modify'),
        defaultValue: 'subtract',
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    remark:{
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
    }
}, {
    tableName: 'inventorytransaction',
    timestamps: true,
    paranoid: true,
});

export default InventoryTransaction;