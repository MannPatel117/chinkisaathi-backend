import { AccountsTransaction } from "./accountTransaction.model.js";
import { AccountsTransactionDetails } from "./accountTransactionDetails.model.js";
import { Inventory } from "./inventory.model.js";
import { InventoryDetails } from "./inventoryDetails.modell.js";
import { InventoryTransaction } from "./inventoryTransaction.model.js";
import { BillMaster } from "./bills.model.js";
import { billTransactionDetails } from "./billTransactionDetails.model.js";
import { Account } from "./account.model.js";
import { product } from "./product.model.js";
import { InventoryAccountBalance } from './inventoryAccountBalance.model.js';
import { User } from "./users.model.js";
import { RewardsPoint } from "./rewardPoints.model.js";
import { Coupon } from "./coupons.model.js";
import { Offer } from "./offers.model.js";

// 🟢 Account Transactions Relations
AccountsTransaction.belongsTo(Account, { foreignKey: "supplier", as: "Supplier" });
AccountsTransaction.belongsTo(Inventory, { foreignKey: "inventory", as: "Inventory" });
AccountsTransaction.hasMany(AccountsTransactionDetails, { foreignKey: "accountTransaction", as: "transactionDetails" });

// 🟢 Account Transactions Details Relations
AccountsTransactionDetails.belongsTo(AccountsTransaction, { foreignKey: "accountTransaction" });
AccountsTransactionDetails.belongsTo(product, { foreignKey: "productID" });

// 🟢 Inventory Relations
Inventory.hasMany(InventoryDetails, { foreignKey: "inventoryID", as: "inventoryDetails" });
InventoryDetails.belongsTo(Inventory, { foreignKey: "inventoryID" });
InventoryDetails.belongsTo(product, { foreignKey: "productID" });

// 🟢 Inventory Transactions
InventoryTransaction.belongsTo(Inventory, { foreignKey: "inventoryID" });
InventoryTransaction.belongsTo(product, { foreignKey: "productID" });
InventoryTransaction.belongsTo(AccountsTransaction, { foreignKey: "accountTransactionID" });
InventoryTransaction.belongsTo(BillMaster, { foreignKey: "billID" });

// 🟢 Bill Master Relations
BillMaster.belongsTo(Account, { foreignKey: "supplier", as: "Supplier" });
BillMaster.belongsTo(Inventory, { foreignKey: "inventoryID", as: "Inventory" });
BillMaster.belongsTo(User, { foreignKey: "phoneNumber", as: "User" });
BillMaster.belongsTo(Offer, { foreignKey: "offerID", as: "Offer" });
BillMaster.hasMany(billTransactionDetails, { foreignKey: "billID", as: "billDetails" });

// 🟢 Bill Transaction Details
billTransactionDetails.belongsTo(BillMaster, { foreignKey: "billID" });
billTransactionDetails.belongsTo(product, { foreignKey: "productID" });


// Track unique balances between Inventory and Account
Inventory.hasMany(InventoryAccountBalance, { foreignKey: "inventoryID" });
Account.hasMany(InventoryAccountBalance, { foreignKey: "accountID" });

InventoryAccountBalance.belongsTo(Inventory, { foreignKey: "inventoryID" });
InventoryAccountBalance.belongsTo(Account, { foreignKey: "accountID" });

RewardsPoint.belongsTo(BillMaster, { foreignKey: "billID", as: "Bill" });
RewardsPoint.belongsTo(User, { foreignKey: "phoneNumber", as: "User" });

BillMaster.hasMany(RewardsPoint, { foreignKey: "billID", as: "Rewards" });
User.hasMany(RewardsPoint, { foreignKey: "phoneNumber", as: "UserRewards" });


Offer.belongsTo(product, { foreignKey: "freeProductID", as: "FreeProduct" });
Offer.hasMany(Coupon, { foreignKey: "offerID", as: "Coupons" });

Coupon.belongsTo(Offer, { foreignKey: "offerID", as: "Offer" });


// billTransactionDetails.belongsTo(BillMaster, {
//     foreignKey: "billID",
//     onDelete: "CASCADE",
//   });
  
//   // BillTransactionDetails belongs to Product
//   billTransactionDetails.belongsTo(product, {
//     foreignKey: "productID",
//     onDelete: "CASCADE",
//   });
  
//   // BillMaster has many BillTransactionDetails
//   BillMaster.hasMany(billTransactionDetails, {
//     foreignKey: "billID",
//     onDelete: "CASCADE",
//   });
  
//   // Product has many BillTransactionDetails
//   product.hasMany(billTransactionDetails, {
//     foreignKey: "productID",
//     onDelete: "CASCADE",
//   });