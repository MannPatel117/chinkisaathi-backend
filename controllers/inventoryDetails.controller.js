import { ApiResponse } from "../utils/ApiResponse.js";
import { product } from "../model/product.model.js";
import { Inventory } from "../model/inventory.model.js";
import { sequelize } from "../db/connection.js";
import { InventoryDetails } from "../model/inventoryDetails.modell.js";
import colors from "colors";
import { Op } from "sequelize";
import { Sequelize } from "sequelize";
import InventoryTransaction from "../model/inventoryTransaction.model.js";
import { AccountsTransaction } from "../model/accountTransaction.model.js";
import { Account } from "../model/account.model.js";
import { BillMaster } from "../model/bills.model.js";

// 1. Update Inventory Detail by ID
const updateInventoryDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedDetail = await InventoryDetails.update(updateData, {
      where: { id },
      returning: true,
      plain: true,
    });

    if (!updatedDetail[1]) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Inventory detail not found", false));
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedDetail[1],
          "Inventory detail updated successfully",
          true
        )
      );
  } catch (error) {
    console.error("Error updating inventory detail:", error);
    res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error", false));
  }
};

// 2. Get Inventory Detail by ID
const getInventoryDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    const detail = await InventoryDetails.findOne({ where: { id } });

    if (!detail) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Inventory detail not found", false));
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          detail,
          "Inventory detail fetched successfully",
          true
        )
      );
  } catch (error) {
    console.error("Error fetching inventory detail:", error);
    res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error", false));
  }
};

// 4. Delete Inventory Detail by ID
const deleteInventoryDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await InventoryDetails.destroy({ where: { id } });

    if (!deleted) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Inventory detail not found", false));
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Inventory detail deleted successfully",
          true
        )
      );
  } catch (error) {
    console.error("Error deleting inventory detail:", error);
    res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error", false));
  }
};

// 5. Get All Inventory Details with Pagination

const getAllInventoryDetails = async (req, res) => {
  try {
    const { pagination, page, limit, status, search, lowWarning, inventory } =
      req.query;

    if (pagination === "true") {
      // Parse page and limit parameters or set defaults
      const pageNumber = parseInt(page, 10) || 1; // Default to page 1
      const pageSize = parseInt(limit, 10) || 10; // Default to 10 items per page
      const offset = (pageNumber - 1) * pageSize;

      // Build query with filters
      const query = { deletedAt: null };

      if (status) {
        query.status = status;
      }

      if (lowWarning === "true") {
        query.quantity = { [Op.lt]: Sequelize.col("lowWarning") }; // Fetch items below their low warning level
      }

      const inventoryArr = JSON.parse(inventory);

      if (search) {
        query[Op.or] = [
          { "$MasterProduct.productName$": { [Op.like]: `%${search}%` } },
          { "$MasterProduct.aliasName$": { [Op.like]: `%${search}%` } },
          { "$MasterProduct.barcode$": { [Op.like]: `%${search}%` } },
        ];
      }

      if (inventoryArr.length > 0) {
        query.inventoryID = { [Op.in]: inventoryArr };
      }
      // Fetch paginated data
      const { count, rows } = await InventoryDetails.findAndCountAll({
        offset: offset,
        limit: pageSize,
        where: query,
        include: [
          {
            model: product,
            as: "MasterProduct",
            attributes: ["productName", "barcode"],
          },
        ],
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            pagination: {
              totalRecords: count,
              currentPage: pageNumber,
              totalPages: Math.ceil(count / pageSize),
            },
            data: rows,
          },
          "Inventory Detail fetched successfully",
          true
        )
      );
    } else {
      // Build query with filters for non-paginated request
      const query = { deletedAt: null };

      if (status) {
        query.status = status;
      }

      if (lowWarning === "true") {
        query.quantity = { [Op.lt]: Sequelize.col("lowWarning") }; // Fetch items below their low warning level
      }

      const inventoryArr = JSON.parse(inventory);

      if (search) {
        query[Op.or] = [
          { "$MasterProduct.productName$": { [Op.like]: `%${search}%` } },
          { "$MasterProduct.aliasName$": { [Op.like]: `%${search}%` } },
          { "$MasterProduct.barcode$": { [Op.like]: `%${search}%` } },
        ];
      }

      if (inventoryArr.length > 0) {
        query.inventoryID = { [Op.in]: inventoryArr };
      }
      // Fetch paginated data
      const { count, rows } = await InventoryDetails.findAndCountAll({
        where: query,
        include: [
          {
            model: product,
            as: "MasterProduct",
            attributes: ["productName", "barcode"],
          },
        ],
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            rows,
            "Inventory Detail fetched successfully",
            true
          )
        );
    }
  } catch (error) {
    console.error("Error fetching Inventory Details", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, "Please contact support", "Server Error", false)
      );
  }
};


const getAllInventoryDetailsForInventory = async (req, res) => {
  try {
    const { status, inventory } =
      req.query;

      const query = { deletedAt: null };

      if (status) {
        query.status = status;
      }

      const inventoryArr = JSON.parse(inventory);

      if (inventoryArr.length > 0) {
        query.inventoryID = { [Op.in]: inventoryArr };
      }
      // Fetch paginated data
      const { count, rows } = await InventoryDetails.findAndCountAll({
        where: query,
        include: [
          {
            model: product,
            as: "MasterProduct",
          },
        ],
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            rows,
            "Inventory Detail fetched successfully",
            true
          )
        );
  } catch (error) {
    console.error("Error fetching Inventory Details", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, "Please contact support", "Server Error", false)
      );
  }
};

const inventoryStats = async (req, res) => {
  const { inventory } = req.query;
  const query = { deletedAt: null };
  const inventoryArr = JSON.parse(inventory);

  if (inventoryArr.length > 0) {
    query.inventoryID = { [Op.in]: inventoryArr };
  }

  try {
    const totalCount = await InventoryDetails.count({
      where: query,
    });
    query.quantity = { [Op.lt]: Sequelize.col("lowWarning") };
    // Count products that are not deleted (assuming 'deletedAt' field is used for soft deletes)
    const lowCount = await InventoryDetails.count({
      where: query,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { totalCount: totalCount, lowCount: lowCount },
          "Inventory Stats",
          true
        )
      );
  } catch (error) {
    console.error("Error fetching stats", error);
    return res
      .status(500)
      .json(new ApiResponse(500, "Please contact Mann", "Server Error", false));
  }
};

// 7. Ensure Product-Inventory Combinations Exist
const ensureProductInventoryCombinations = async (req, res) => {
  try {
    const inventoryIDs = req.params.id;
    console.log(inventoryIDs);
    const products = await product.findAll({ attributes: ["productID"] });
    const productIDs = products.map((p) => p.productID);
    const inventoryDetail = await InventoryDetails.findAll({
      where: { inventoryID: inventoryIDs },
    });
    const inventoryProductIDs = inventoryDetail.map((p) => p.productID);
    const inventoryProductIDsSet = new Set(inventoryProductIDs);
    const missingFields = productIDs.filter(
      (item) => !inventoryProductIDsSet.has(item)
    );

    for (const missingField of missingFields) {
      InventoryDetails.create({
        inventoryID: inventoryIDs, // Associate with the new Inventory
        productID: missingField, // Use the productID from MasterProduct
        quantity: 0, // Set default quantity (or adjust as needed)
        lowWarning: 20, // Default low warning (adjust as needed)
        status: "active", // Default status (adjust as needed)
      });
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, null, "Missing products added successfully", true)
      );
  } catch (error) {
    console.error("Error ensuring product-inventory combinations:", error);
    res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error", false));
  }
};

const getInventoryTransactions = async (req, res) => {
  try {
    const { productID, inventoryID } = req.query;

    if (!productID || !inventoryID) {
      return res
        .status(400)
        .json({ error: "Product ID and Inventory ID are required." });
    }

    // Fetch latest 10 "add" transactions with AccountsTransaction details
    const addTransactions = await InventoryTransaction.findAll({
      where: { productID, inventoryID, type: "add" },
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: AccountsTransaction,
          as: "AccountsTransaction",
          required: false,
          attributes: ["transactionID", "transactionType", "supplier"],
          include: [
            {
              model: Account,
              as: "Supplier",
              attributes: ["supplierID", "accountName"],
            },
          ],
        },
      ],
    });

    // Fetch latest 10 "subtract" transactions with BillMaster details
    const subtractTransactions = await InventoryTransaction.findAll({
      where: { productID, inventoryID, type: "subtract" },
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: BillMaster,
          as: "BillMaster",
          required: false,
          attributes: ["billID", "billNumber", "supplier"],
        },
      ],
    });

    // Combine results
    const transactions = [...addTransactions, ...subtractTransactions];
    // Modify response
    const response = transactions.map((transaction) => {
      let transactionData = transaction.toJSON();

      if (
        transactionData.type === "add" &&
        transactionData.AccountsTransaction
      ) {
        transactionData.supplierName =
          transactionData.AccountsTransaction.Supplier?.accountName ||
          "Unknown Supplier";
      } else if (transactionData.type === "subtract" && transactionData.Bill) {
        transactionData.billNumber = transactionData.Bill.billNumber;
      }

      return transactionData;
    });

    return res
      .status(200)
      .json(new ApiResponse(200, response, "Transactions fetched", true));
  } catch (error) {
    console.error("Error fetching inventory transactions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const addReconciliation = async (req, res) => {
  const { transactionDetail } = req.body;
  const t = await sequelize.transaction();
  console.log(transactionDetail);
  for (const detail of transactionDetail) {
    console.log(detail)
    const { inventoryID, productID, quantityLost, quantityFound, remark } =
      detail;
    let quantityCalc = 0;
    let typeCalc = "add";
    if (quantityLost > 0) {
      quantityCalc = quantityLost;
      typeCalc = "subtract";
    } else if (quantityFound > 0) {
      quantityCalc = quantityFound;
      typeCalc = "add";
    } else {
      res
        .status(500)
        .json(
          new ApiResponse(
            500,
            null,
            "Cannot have both Lost and Found together",
            false
          )
        );
    }
    await InventoryTransaction.create(
      {
        inventoryID,
        productID,
        quantity: quantityCalc,
        type: typeCalc,
        reason: "RECONCILIATION",
        remark: remark
      },
      { transaction: t }
    );

    // Update Inventory Details
    const inventoryDetail = await InventoryDetails.findOne({
      where: { inventoryID: inventoryID, productID: productID },
      transaction: t,
    });

    if (inventoryDetail) {
      if (quantityLost > 0) {
        inventoryDetail.quantity -= quantityLost;
      } else if (quantityFound > 0) {
        inventoryDetail.quantity += quantityFound;
      }
      await inventoryDetail.save({ transaction: t });
    }
  }
  await t.commit();
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Success",
        "Reconciliation created successfully",
        true
      )
    );
};

export {
  updateInventoryDetail,
  getInventoryDetailById,
  deleteInventoryDetailById,
  getAllInventoryDetails,
  ensureProductInventoryCombinations,
  inventoryStats,
  getInventoryTransactions,
  addReconciliation,
  getAllInventoryDetailsForInventory
};
