import { Inventory } from '../model/inventory.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { product } from '../model/product.model.js';
import { InventoryDetails } from '../model/inventoryDetails.modell.js';
import { InventoryAccountBalance } from '../model/inventoryAccountBalance.model.js';
import { Account } from '../model/account.model.js';
import { Op } from "sequelize";

/*
    Function Name - createInventory
    Functionality - Function Creates Inventory - Inventory helps managed inventoryDetails which help us with Inventory Management
*/

const createInventory = async (req, res) => {
  try {
      // Step 1: Create new Inventory
      const newInventory = await Inventory.create(req.body);

      // Step 2: Fetch all product IDs
      const productIDs = await product.findAll({ attributes: ['productID'] });

      // Step 3: Create Inventory Details for each product
      const inventoryDetailsPromises = productIDs.map(product =>
          InventoryDetails.create({
              inventoryID: newInventory.inventoryID,
              productID: product.productID,
              quantity: 0,
              lowWarning: 20,
              status: 'active',
          })
      );
      await Promise.all(inventoryDetailsPromises);

      // Step 4: Fetch all accounts (suppliers)
      const accounts = await Account.findAll({ attributes: ['supplierID'] });

      // Step 5: Create InventoryAccountBalance for all accounts
      const balancePromises = accounts.map(account =>
          InventoryAccountBalance.create({
              inventoryID: newInventory.inventoryID,
              accountID: account.supplierID,
              openingBalance: 0,
              closingBalance: 0,
          })
      );
      await Promise.all(balancePromises);

      return res
          .status(201)
          .json(new ApiResponse(201, newInventory, "Inventory created with account balances", true));
  } catch (error) {
      console.error("Error creating inventory:", error);
      return res
          .status(500)
          .json(new ApiResponse(500, "Please contact Mann", "Internal Server Error", false));
  }
};

/*
    Function Name - getInventoryById
    Functionality - Function gets Inventory by ID - This API has a toggle - IF Details is true, then sends all fields ELSE only billNumber and invoiceNumber with id and Name
*/

   const getInventoryById = async (req, res) => {
    try {
      const id  = req.params.id;
      const details = req.query.details;
    console.log(id, details)
      if(details === "true"){
        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({
              success: false,
              message: "Inventory not found",
            });
        }
        return res
        .status(200)
        .json(new ApiResponse(200, inventory, "Inventory Fetched", true));
      }
    else{
        const inventory = await Inventory.findOne({
            where: { inventoryID: id },
            attributes:  ["inventoryID", "inventoryName", "billNumber", "invoiceNumber", "paymentVoucherDocNo", "receiptVoucherDocNo", "goodsReceiptDocNo", "bankAmount", "cashAmount", "otherAmount"], // Select specific fields
        });
        if (!inventory) {
            return res.status(404).json({
              success: false,
              message: "Inventory not found",
            });
        }
        return res
        .status(200)
        .json(new ApiResponse(200, inventory, "Inventory Fetched", true));
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

/*
    Function Name - updateInventory
    Functionality - Function gets Inventory by ID and PATCH
*/

  const updateInventory = async (req, res) => {
    try {
      const { id } = req.params;
      const [updated] = await Inventory.update(req.body, { where: { inventoryID: id } });
  
      if (!updated) {
            return res
        .status(500)
        .json(
            new ApiResponse(
            500,
            "Please contact Mann",
            "Internal Server Error",
            false
            )
        );
      }
  
      const updatedInventory = await Inventory.findByPk(id);
      return res
      .status(201)
      .json(new ApiResponse(201, updatedInventory, "Inventory updated", true));
    } catch (error) {
      console.error("Error updating inventory:", error);
      return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "Please contact Mann",
          "Internal Server Error",
          false
        )
      );
    }
  };

  /*
    Function Name - deleteInventory
    Functionality - Function gets Inventory by ID and DELETE
*/

 const deleteInventory = async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Inventory.destroy({ where: { inventoryID: id }, force: true });
  
      if (!deleted) {
        return res
        .status(500)
        .json(
            new ApiResponse(
            500,
            "Please contact Mann",
            "Internal Server Error",
            false
            )
        );
      }
  
      return res
      .status(201)
      .json(new ApiResponse(201, deleted, "Inventory deleted", true));
    } catch (error) {
      console.error("Error deleting inventory:", error);
      return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "Please contact Mann",
          "Internal Server Error",
          false
        )
      );
    }
  };

    /*
    Function Name - getAllInventories
    Functionality - Function gets ALL Inventory
*/
  
const getAllInventories = async (req, res) => {
  try {
    const { page = 1, limit = 10, pagination = "true", inventory } = req.query; // Default pagination to "true"
    
    let inventories;
    let count;
    const whereClause = {};
    const inventoryArr = JSON.parse(inventory);
    if (inventoryArr.length > 0) {
                whereClause.inventoryID = { [Op.in]: inventoryArr };
    }

    if (pagination === "false") {
      // Fetch all data without pagination
      inventories = await Inventory.findAll({
        where: whereClause,
        attributes: ["inventoryID", "inventoryName", "billNumber", "invoiceNumber", "paymentVoucherDocNo", "receiptVoucherDocNo", "goodsReceiptDocNo", "bankAmount", "cashAmount", "otherAmount"],
      });
      count = inventories.length; // Total items count
    } else {
      // Apply pagination
      const offset = (page - 1) * limit;
      const result = await Inventory.findAndCountAll({
        where: whereClause,
        attributes: ["inventoryID", "inventoryName", "billNumber", "invoiceNumber", "paymentVoucherDocNo", "receiptVoucherDocNo", "goodsReceiptDocNo", "bankAmount", "cashAmount", "otherAmount"],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
      inventories = result.rows;
      count = result.count;
    }

    return res.status(200).json({
      success: true,
      message: "Inventories fetched successfully",
      data: inventories,
      pagination: pagination === "false" ? null : {
        totalItems: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inventories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllInventoryIDs = async (req, res) => {
  try {
    // Fetch only inventoryID column from Inventory table
    const inventories = await Inventory.findAll({
      attributes: ["inventoryID"],
    });

    // Extract inventoryID values into an array
    const inventoryIDs = inventories.map((inv) => inv.inventoryID);

    return res.status(200).json(new ApiResponse(200, inventoryIDs, "Inventory IDs fetched successfully", true));
  } catch (error) {
    console.error("Error fetching inventory IDs:", error);
    return res.status(500).json(new ApiResponse(500, "Something went wrong", "Error", false));
  }
};

  
  export { createInventory, getInventoryById, updateInventory, deleteInventory, getAllInventories, getAllInventoryIDs }