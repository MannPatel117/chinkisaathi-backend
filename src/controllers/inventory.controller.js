import { Inventory } from '../model/inventory.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { product } from '../model/product.model.js';
import { InventoryDetails } from '../model/inventoryDetails.modell.js'

/*
    Function Name - createInventory
    Functionality - Function Creates Inventory - Inventory helps managed inventoryDetails which help us with Inventory Management
*/

 const createInventory = async (req, res) => {
    try {
      const newInventory = await Inventory.create(req.body);
    const productIDs = await product.findAll({
        attributes: ['productID'],
      });
      const inventoryDetailsPromises = productIDs.map(product => {
        return InventoryDetails.create({
          inventoryID: newInventory.inventoryID,  // Associate with the new Inventory
          productID: product.productID,          // Use the productID from MasterProduct
          quantity: 0,                           // Set default quantity (or adjust as needed)
          lowWarning: 20,                        // Default low warning (adjust as needed)
          status: 'active',                      // Default status (adjust as needed)
        });
      });
      return res
      .status(201)
      .json(new ApiResponse(201, newInventory, "Inventory created", true));
    } catch (error) {
      console.error("Error creating inventory:", error);
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
            attributes: ["inventoryID", "inventoryName", "billNumber", "invoiceNumber"], // Select specific fields
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
      const { page = 1, limit = 10 } = req.query; // Default to page 1 with 10 items per page
      const offset = (page - 1) * limit;
  
      const { count, rows: inventories } = await Inventory.findAndCountAll({
        attributes: ["inventoryID", "inventoryName", "billNumber", "invoiceNumber"], // Select specific fields
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
  
      return res.status(200).json({
        success: true,
        message: "Inventories fetched successfully",
        data: inventories,
        pagination: {
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
  

  
  export { createInventory, getInventoryById, updateInventory, deleteInventory, getAllInventories }