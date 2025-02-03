import { ApiResponse } from "../utils/ApiResponse.js";
import { product } from "../model/product.model.js";
import { Inventory } from "../model/inventory.model.js"
import { InventoryDetails } from '../model/inventoryDetails.modell.js'
import colors from 'colors';


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
            return res.status(404).json(new ApiResponse(404, null, 'Inventory detail not found', false));
        }

        res.status(200).json(new ApiResponse(200, updatedDetail[1], 'Inventory detail updated successfully', true));
    } catch (error) {
        console.error('Error updating inventory detail:', error);
        res.status(500).json(new ApiResponse(500, null, 'Internal server error', false));
    }
};

// 2. Get Inventory Detail by ID
 const getInventoryDetailById = async (req, res) => {
    try {
        const { id } = req.params;

        const detail = await InventoryDetails.findOne({ where: { id } });

        if (!detail) {
            return res.status(404).json(new ApiResponse(404, null, 'Inventory detail not found', false));
        }

        res.status(200).json(new ApiResponse(200, detail, 'Inventory detail fetched successfully', true));
    } catch (error) {
        console.error('Error fetching inventory detail:', error);
        res.status(500).json(new ApiResponse(500, null, 'Internal server error', false));
    }
};

// 4. Delete Inventory Detail by ID
 const deleteInventoryDetailById = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await InventoryDetails.destroy({ where: { id } });

        if (!deleted) {
            return res.status(404).json(new ApiResponse(404, null, 'Inventory detail not found', false));
        }

        res.status(200).json(new ApiResponse(200, null, 'Inventory detail deleted successfully', true));
    } catch (error) {
        console.error('Error deleting inventory detail:', error);
        res.status(500).json(new ApiResponse(500, null, 'Internal server error', false));
    }
};

// 5. Get All Inventory Details with Pagination
const getAllInventoryDetails = async (req, res) => {
    try {
        const { page = 1, limit = 10, pagination } = req.query;
        const offset = (page - 1) * limit;
        if(pagination=="true"){
            const { count, rows } = await InventoryDetails.findAndCountAll({
                limit: parseInt(limit),
                offset: parseInt(offset),
                include: [
                    {
                        model: product, // Assuming `MasterProduct` is the table you want to join
                        attributes: ['productName', 'barcode'], // Specify the fields you need from MasterProduct
                    },
                ],
            });
            res.status(200).json(new ApiResponse(200, { total: count, data: rows }, 'Inventory details fetched successfully', true));
        } else {
            const { count, rows } = await InventoryDetails.findAndCountAll({
                include: [
                    {
                        model: product, // Assuming `MasterProduct` is the table you want to join
                        attributes: ['productName', 'barcode'], // Specify the fields you need from MasterProduct
                    },
                ],
            });
            res.status(200).json(new ApiResponse(200, { data: rows }, 'Inventory details fetched successfully', true));
        }
    } catch (error) {
        console.error('Error fetching inventory details:', error);
        res.status(500).json(new ApiResponse(500, null, 'Internal server error', false));
    }
};

// 7. Ensure Product-Inventory Combinations Exist
 const ensureProductInventoryCombinations = async (req, res) => {
    try {
        const inventoryIDs  = req.params.id;
        console.log(inventoryIDs)
        const products = await product.findAll({ attributes: ['productID'] });
        const productIDs = products.map(p => p.productID);
        const inventoryDetail = await InventoryDetails.findAll({where: {inventoryID: inventoryIDs} })
        const inventoryProductIDs = inventoryDetail.map(p => p.productID);
        const inventoryProductIDsSet = new Set(inventoryProductIDs)
        const missingFields = productIDs.filter(item => !inventoryProductIDsSet.has(item));
   
        
        for(const missingField of missingFields){
            InventoryDetails.create({
                inventoryID: inventoryIDs,  // Associate with the new Inventory
                productID: missingField,          // Use the productID from MasterProduct
                quantity: 0,                           // Set default quantity (or adjust as needed)
                lowWarning: 20,                        // Default low warning (adjust as needed)
                status: 'active',                      // Default status (adjust as needed)
            });
        }
    

        res.status(200).json(new ApiResponse(200, null, 'Missing products added successfully', true));
    } catch (error) {
        console.error('Error ensuring product-inventory combinations:', error);
        res.status(500).json(new ApiResponse(500, null, 'Internal server error', false));
    }
};

export { updateInventoryDetail, getInventoryDetailById,  deleteInventoryDetailById, getAllInventoryDetails, ensureProductInventoryCombinations}