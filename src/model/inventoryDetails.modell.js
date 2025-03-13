import { Sequelize, DataTypes } from "sequelize";
import { initialSequelize } from "../utils/sql.js";
import { Inventory } from './inventory.model.js';
import { product } from './product.model.js';

const sequelize = initialSequelize();

export const InventoryDetails = (await sequelize).define('InventoryDetails', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true, // Auto-incrementing supplierID
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
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    lowWarning: {
        type: DataTypes.INTEGER,
        defaultValue: 20,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
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
    tableName: 'inventoryDetails',
    timestamps: true,
    paranoid: true,
});

// Establish associations
Inventory.hasMany(InventoryDetails, { foreignKey: 'inventoryID' });
product.hasMany(InventoryDetails, { foreignKey: 'productID' });

InventoryDetails.belongsTo(Inventory, { foreignKey: "inventoryID", as: "inventoryDetail" });
InventoryDetails.belongsTo(product, { foreignKey: 'productID' });

export default InventoryDetails;