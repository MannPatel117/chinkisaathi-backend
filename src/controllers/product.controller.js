import { ApiResponse } from "../utils/ApiResponse.js";
import { product } from "../model/product.model.js";

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
        } = req.body;

        // Validate required fields
        if (
        !productName ||
        !aliasName ||
        !barcode ||
        !mrp ||
        !discount ||
        !sellingPrice ||
        !wholeSalePrice ||
        !gst
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
        });

        // Respond with the created product
        return res
        .status(200)
        .json(
            new ApiResponse(
            200,
            newProduct,
            "Product created successfully",
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
              let barcode= req.params.barcode;
              const _product = await product.findOne({
                where: {
                    barcode: barcode,
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
              .json(new ApiResponse(500, "Please contact Mann", "Server Error", false));
        }
    };

/*
    Function Name - updateProduct
    Functionality - updates Product details
*/

    const updateProduct = async (req, res) => {
            try {
              const  barcode  = req.params.barcode; 
              const updates = req.body; // JSON body containing the fields to update
          
              // Perform the update
              await product.update(updates, {
                where: { barcode: barcode }
              });
          
              const updatedProduct = await product.findOne({
                where: { barcode: barcode }
              });
          
              return res
                .status(200)
                .json(new ApiResponse(200, 
                    updatedProduct, "Product updated", true));
            } catch (error) {
              console.error('Error updating product:', error);
              return res
              .status(500)
              .json(new ApiResponse(500, "Please contact Mann", "Server Error", false));
            }
    };

/*
    Function Name - deleteProduct
    Functionality - deletes Product 
*/

    const deleteProduct = async (req, res) => {
            try {
            const barcode  = req.params.barcode; 
            const role = req.user.role;
            const foundProduct = await product.findOne({
              where: { barcode: barcode }
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
                where: { barcode: barcode }
            });
          
            return res
              .status(200)
              .json(new ApiResponse(200, 
                  `${productName} is successfully deleted`, "Product deleted", true));
            } catch (error) {
              console.error('Error deleting product:', error);
              return res
              .status(500)
              .json(new ApiResponse(500, "Please contact Mann", "Server Error", false));
            }
    };

/*
    Function Name - allProduct
    Functionality - Function to fetch all products
*/

    const allProduct = async (req, res) => {
        try {
          const { pagination, page, limit, productType, status } = req.query;
      
          if (pagination === 'true') {
            // Parse page and limit parameters or set defaults
            const pageNumber = parseInt(page, 10) || 1; // Default to page 1
            const pageSize = parseInt(limit, 10) || 10; // Default to 10 items per page
            const offset = (pageNumber - 1) * pageSize;
            const query = { deletedAt: null }

            if(productType){
                query.productType = productType;
            }

            if(status){
                query.status = status;
            }

            // Fetch paginated data
            const { count, rows } = await product.findAndCountAll({
              offset: offset,
              limit: pageSize,
              where: query
            });
      
            return res
            .status(200)
            .json(new ApiResponse(200, 
              { 
                pagination: {
                    totalRecords: count,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(count / pageSize),
                },
                data: rows
               }, "Products fetched", true));
          } else {
            const query = { deletedAt: null }

            if(productType){
                query.productType = productType;
            }

            if(status){
                query.status = status;
            }
            const allProduct = await product.findAll({
              where: query, 
            });
      
            return res
            .status(200)
            .json(new ApiResponse(200, 
                allProduct, "All Products fetched", true));
          }
        } catch (error) {
          console.error('Error fetching Products', error);
          return res
          .status(500)
          .json(new ApiResponse(500, "Please contact Mann", "Server Error", false));
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
              .json(new ApiResponse(500, "Please contact Mann", "Server Error", false));
    }
    };

export { createProduct, getProduct, updateProduct, deleteProduct, allProduct, productStats };
