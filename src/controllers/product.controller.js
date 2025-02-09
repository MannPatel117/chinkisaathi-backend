import { ApiResponse } from "../utils/ApiResponse.js";
import { product } from "../model/product.model.js";
import { Inventory } from "../model/inventory.model.js"
import { InventoryDetails } from '../model/inventoryDetails.modell.js'
import { Op } from "sequelize";
/*
    Function Name - createProduct
    Functionality - Creates Product
*/

    const createProduct = async (req, res) => {
    try {
        // Destructure the fields from the request body
        const {
        productName,
        aliasName,
        barcode,
        productType,
        img,
        mrp,
        discount,
        sellingPrice,
        wholeSalePrice,
        gst,
        hsnCode,
        status,
        category
        } = req.body;

        // Validate required fields
        if (
        !productName ||
        !aliasName ||
        !barcode
        ) { 
            return res
            .status(400)
            .json(
            new ApiResponse(
                400,
                "Some fields are missing",
                "Invalid Action",
                false
            )
            );
        }

        const existingProduct = await product.findOne({
        where: { barcode: barcode },
        });
        if (existingProduct) {
        return res
            .status(409)
            .json(
            new ApiResponse(
                409,
                "Product barcode already exists",
                "Invalid Action",
                false
            )
            );
        }

        // Create a new product
        const newProduct = await product.create({
        productName,
        aliasName,
        barcode,
        productType,
        img,
        mrp,
        discount,
        sellingPrice,
        wholeSalePrice,
        gst,
        hsnCode,
        status,
        category
        });

        const inventories = await Inventory.findAll({
            attributes: ['inventoryID']
        });

        const inventoryDetailsPromises = inventories.map(inventory => {
            return InventoryDetails.create({
                inventoryID: inventory.inventoryID,  // Link to existing inventory
                productID: newProduct.productID,    // Link to the newly created product
                quantity: 0,                        // Default quantity
                lowWarning: 20,                     // Default low warning
                status: 'active',                   // Default status
            });
        });

        // Wait for all InventoryDetails to be created
        await Promise.all(inventoryDetailsPromises);

        // Respond with the created product
        return res
        .status(200)
        .json(
            new ApiResponse(
            200,
            newProduct,
            "Product Created",
            true
            )
        );
    } catch (error) {
        console.error("Error creating product:", error);
        if (error.name === "SequelizeUniqueConstraintError") {
        return res
            .status(409)
            .json({ message: "Product with this barcode already exists." });
        }
        return res
        .status(409)
        .json(
            new ApiResponse(
            409,
            "Could not create Product, please try again later " + error,
            "Action Failed",
            false
            )
        );
    }
    };

/*
    Function Name - getProduct
    Functionality - fetches Product by barcode
*/

    const getProduct = async (req, res) => {
    try {
              let id= req.params.id;
              const _product = await product.findOne({
                where: {
                    productID: id,
                }
              });
          
              if (!_product) {
                return res
                .status(401)
                .json(new ApiResponse(401, "Product does not exist", "Product not found", false));
              }
          
              return res
                .status(200)
                .json(new ApiResponse(200, 
                    _product, "Product found", true));
          
            } catch (error) {
              console.error('Error finding product:', error);
              return res
              .status(500)
              .json(new ApiResponse(500, "Please contact Support", "Server Error", false));
        }
    };

/*
    Function Name - updateProduct
    Functionality - updates Product details
*/

    const updateProduct = async (req, res) => {
            try {
              const  id  = req.params.id; 
              const updates = req.body; // JSON body containing the fields to update
          
              // Perform the update
              await product.update(updates, {
                where: { productID: id }
              });
          
              const updatedProduct = await product.findOne({
                where: { productID: id }
              });
          
              return res
                .status(200)
                .json(new ApiResponse(200, 
                    updatedProduct, "Product Updated", true));
            } catch (error) {
              console.error('Error updating product:', error);
              return res
              .status(500)
              .json(new ApiResponse(500, "Please contact Support", "Server Error", false));
            }
    };

/*
    Function Name - deleteProduct
    Functionality - deletes Product 
*/

    const deleteProduct = async (req, res) => {
            try {
            const id  = req.params.id; 
            const role = req.user.role;
            const foundProduct = await product.findOne({
              where: { productID: id }
            });
            
            if (!foundProduct) {
                return res
                .status(401)
                .json(new ApiResponse(401, "Product does not exist", "Product not found", false));
            }
    
            if(role!='superadmin' && role!= 'admin'){
                return res
                .status(403)
                .json(new ApiResponse(403, "User does not have permissions", "Forbidden", false));
            }
            
            const productName = foundProduct.dataValues.aliasName;
            await product.destroy({
                where: { productID: id },
                force: true,
            });
            
            return res
              .status(200)
              .json(new ApiResponse(200, 
                  `${productName} is successfully deleted`, "Product Deleted", true));
            } catch (error) {
              console.error('Error deleting product:', error);
              return res
              .status(500)
              .json(new ApiResponse(500, "Please contact Support", "Server Error", false));
            }
    };

/*
    Function Name - allProduct
    Functionality - Function to fetch all products
*/

 const allProduct = async (req, res) => {
    try {
      const { pagination, page, limit, productType, status, search } = req.query;
  
      // Parse pagination parameters
      const pageNumber = parseInt(page, 10) || 1;
      const pageSize = parseInt(limit, 10) || 10;
      const offset = (pageNumber - 1) * pageSize;
  
      // Construct base query
      const query = { deletedAt: null };
  
      if (productType) {
        query.productType = productType;
      }
  
      if (status) {
        query.status = status;
      }
  
      // Search Logic: Look for search term in barcode, productName, and aliasName
      if (search) {
        query[Op.or] = [
          { barcode: { [Op.like]: `%${search}%` } },
          { productName: { [Op.like]: `%${search}%` } },
          { aliasName: { [Op.like]: `%${search}%` } },
        ];
      }
  
      // Handle paginated request
      if (pagination === 'true') {
        const { count, rows } = await product.findAndCountAll({
          offset,
          limit: pageSize,
          where: query,
          raw: true, // Return plain JSON instead of Sequelize instances
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
            'Products fetched',
            true
          )
        );
      }
  
      // Fetch all products without pagination
      const allProducts = await product.findAll({
        where: query,
        raw: true,
      });
  
      return res.status(200).json(new ApiResponse(200, allProducts, 'All Products fetched', true));
    } catch (error) {
      console.error('Error fetching Products:', error);
      return res.status(500).json(new ApiResponse(500, 'Please contact Support', 'Server Error', false));
    }
  };

/*
    Function Name - productStats
    Functionality - Function to fetch stats related to product
*/

    const productStats = async (req, res) => {
    try {
        const activeCount = await product.count({
            where: { status: 'active' },
        });

        // Count products that are not deleted (assuming 'deletedAt' field is used for soft deletes)
        const notDeletedCount = await product.count({
            where: { deletedAt: null },
        });

        return res
                .status(200)
                .json(new ApiResponse(200, 
                    {"activeProducts": activeCount, "totalProducts": notDeletedCount}, "Product Stats", true));
    } catch (error) {
        console.error('Error fetching stats', error);
              return res
              .status(500)
              .json(new ApiResponse(500, "Please contact Support", "Server Error", false));
    }
    };

export { createProduct, getProduct, updateProduct, deleteProduct, allProduct, productStats };
