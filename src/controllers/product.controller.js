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

    const bulkproductobj = [
      {
          "productType": "finished",
          "productName": "CH-35 DETERGENT POWDER 1kg",
          "aliasName": "CH-35/-",
          "mrp": "35",
          "discount": "28.57",
          "sellingPrice": "25",
          "wholeSalePrice": "21",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100575"
      },
      {
          "productType": "finished",
          "productName": "CH-40 DETERGENT POWDER 1kg",
          "aliasName": "CH-40/-",
          "mrp": "40",
          "discount": "25",
          "sellingPrice": "30",
          "wholeSalePrice": "23",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100576"
      },
      {
          "productType": "finished",
          "productName": "CH-45 DETERGENT POWDER 1kg",
          "aliasName": "CH-45",
          "mrp": "45",
          "discount": "22.22",
          "sellingPrice": "35",
          "wholeSalePrice": "30",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100577"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE ACTIVE DETERGENT POWDER 1kg",
          "aliasName": "T.C. ACTIVE 1Kg",
          "mrp": "50",
          "discount": "20",
          "sellingPrice": "40",
          "wholeSalePrice": "32",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100578"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE DETERGENT POWDER (NI-55) 1kg",
          "aliasName": "(NI-55) 1kg",
          "mrp": "55",
          "discount": "18.18",
          "sellingPrice": "45",
          "wholeSalePrice": "34",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100579"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE DETERGENT POWDER  (WH-55) 1kg",
          "aliasName": "(WH-55) 1kg",
          "mrp": "55",
          "discount": "18.18",
          "sellingPrice": "45",
          "wholeSalePrice": "36",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100580"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE DETERGENT POWDER (GH-65) 1kg",
          "aliasName": "(GH-65) 1kg",
          "mrp": "65",
          "discount": "15.38",
          "sellingPrice": "55",
          "wholeSalePrice": "44",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100581"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE DETERGENT POWDER (RN-90) 1kg",
          "aliasName": "(RN-90) 1kg",
          "mrp": "90",
          "discount": "33.33",
          "sellingPrice": "60",
          "wholeSalePrice": "48",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100582"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE DETERGENT POWDER TX 1kg",
          "aliasName": "(TX) 1kg",
          "mrp": "110",
          "discount": "40.91",
          "sellingPrice": "65",
          "wholeSalePrice": "52",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100583"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE DETERGENT POWDER XL-2 1kg",
          "aliasName": "(XL-2) 1kg",
          "mrp": "120",
          "discount": "41.67",
          "sellingPrice": "70",
          "wholeSalePrice": "63",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100584"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE DETERGENT POWDER XL-1 1kg",
          "aliasName": "(XL-1) 1kg",
          "mrp": "130",
          "discount": "42.31",
          "sellingPrice": "75",
          "wholeSalePrice": "68",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100585"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE DETERGENT POWDER XL BLUE 1kg",
          "aliasName": "(XL-BLUE) 1kg",
          "mrp": "135",
          "discount": "40.74",
          "sellingPrice": "80",
          "wholeSalePrice": "69",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100586"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE DETERGENT POWDER AR-2 1kg",
          "aliasName": "(AR-2)",
          "mrp": "140",
          "discount": "35.71",
          "sellingPrice": "90",
          "wholeSalePrice": "76",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100587"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE DETERGENT POWDER AR-1 1kg",
          "aliasName": "(AR-1)",
          "mrp": "150",
          "discount": "33.33",
          "sellingPrice": "100",
          "wholeSalePrice": "81",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100588"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE ACTIVE DET. LIQ. 1Ltr BOTTLE",
          "aliasName": "TOTAL CARE ACTIVE DET. LIQ. 1Ltr BOTTLE",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "48",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100544"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE PLUS DET. LIQ. 1Ltr BOTTLE",
          "aliasName": "TOTAL CARE PLUS DET. LIQ. 1Ltr BOTTLE",
          "mrp": "80",
          "discount": "25",
          "sellingPrice": "60",
          "wholeSalePrice": "57",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100543"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE HI-CLEAN DET. LIQ. 1Ltr BOTTLE",
          "aliasName": "TOTAL CARE HI-CLEAN DET. LIQ. 1Ltr BOTTLE",
          "mrp": "150",
          "discount": "46.67",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100641"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE HI-CLEAN DET. LIQ. 5Ltr CANE",
          "aliasName": "TOTAL CARE HI-CLEAN DET. LIQ. 5Ltr CANE",
          "mrp": "650",
          "discount": "46.15",
          "sellingPrice": "350",
          "wholeSalePrice": "248",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100561"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ EXTRA-CLEAN DISHWASH LIQ. 1Ltr BOTTLE",
          "aliasName": "ZYKZ EXTRA-CLEAN DISHWASH LIQ. 1Ltr BOTTLE",
          "mrp": "70",
          "discount": "50",
          "sellingPrice": "35",
          "wholeSalePrice": "35",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100563"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE ACTIVE DISHWASH LIQ. 1Ltr BOTTLE",
          "aliasName": "ACTIVE DW 1ltr",
          "mrp": "70",
          "discount": "42.86",
          "sellingPrice": "40",
          "wholeSalePrice": "34",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100564"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE PLUS DISHWASH LIQ. 1Ltr BOTTLE",
          "aliasName": "TOTAL CARE PLUS DISHWASH LIQ. 1Ltr BOTTLE",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "41",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100545"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ ACTIVE DISHWASH LIQ. 5Ltr JAR",
          "aliasName": "ZYKZ ACTIVE DISHWASH LIQ. 5Ltr JAR",
          "mrp": "250",
          "discount": "52",
          "sellingPrice": "120",
          "wholeSalePrice": "110",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100565"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ EXTRA-CLEAN DISHWASH LIQ. 5Ltr CANE",
          "aliasName": "ZYKZ EXTRA-CLEAN DISHWASH LIQ. 5Ltr CANE",
          "mrp": "320",
          "discount": "53.13",
          "sellingPrice": "150",
          "wholeSalePrice": "135",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100566"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE ACTIVE DISHWASH LIQ. 5Ltr JAR",
          "aliasName": "TOTAL CARE ACTIVE DISHWASH LIQ. 5Ltr JAR",
          "mrp": "300",
          "discount": "41.67",
          "sellingPrice": "175",
          "wholeSalePrice": "146",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100555"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE PLUS DISHWASH LIQ. 5Ltr JAR",
          "aliasName": "TOTAL CARE PLUS DISHWASH LIQ. 5Ltr JAR",
          "mrp": "350",
          "discount": "42.86",
          "sellingPrice": "200",
          "wholeSalePrice": "184",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100567"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE ADVANCE DISHWASH LIQ. 5Ltr CANE",
          "aliasName": "TOTAL CARE ADVANCE DISHWASH LIQ. 5Ltr CANE",
          "mrp": "500",
          "discount": "34",
          "sellingPrice": "330",
          "wholeSalePrice": "330",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100568"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ ACTIVE SURFACE CLEANER- LAVENDER 1Ltr BOTTLE",
          "aliasName": "ZYKZ ACTIVE SURFACE CLEANER- LAVENDER 1Ltr BOTTLE",
          "mrp": "70",
          "discount": "42.86",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100569"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ ACTIVE SURFACE CLEANER- ROSE 1Ltr BOTTLE",
          "aliasName": "ZYKZ ACTIVE SURFACE CLEANER- ROSE 1Ltr BOTTLE",
          "mrp": "70",
          "discount": "42.86",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100570"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ ACTIVE SURFACE CLEANER- MOGRA 1Ltr BOTTLE",
          "aliasName": "ZYKZ ACTIVE SURFACE CLEANER- MOGRA 1Ltr BOTTLE",
          "mrp": "70",
          "discount": "42.86",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100571"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ ACTIVE SURFACE CLEANER- LEMON 1Ltr BOTTLE",
          "aliasName": "ZYKZ ACTIVE SURFACE CLEANER- LEMON 1Ltr BOTTLE",
          "mrp": "70",
          "discount": "42.86",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100572"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE ACTIVE MULTI SURFACE CLEANER- LEMON 1Ltr BOTTLE",
          "aliasName": "TOTAL CARE ACTIVE MULTI SURFACE CLEANER- LEMON 1Ltr BOTTLE",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "38",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100548"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE ACTIVE MULTI SURFACE CLEANER- ROSE 1Ltr BOTTLE",
          "aliasName": "TOTAL CARE ACTIVE MULTI SURFACE CLEANER- ROSE 1Ltr BOTTLE",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "38",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100546"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE ACTIVE MULTI SURFACE CLEANER- MOGRA 1Ltr BOTTLE",
          "aliasName": "TOTAL CARE ACTIVE MULTI SURFACE CLEANER- MOGRA 1Ltr BOTTLE",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "38",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100547"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE ZYKZ ACTIVE SURFACE CLEANER 1Ltr BOTTLE",
          "aliasName": "TOTAL CARE ZYKZ ACTIVE SURFACE CLEANER 1Ltr BOTTLE",
          "mrp": "140",
          "discount": "50",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100589"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE ACTIVE TOILET CLEANER 500ml BOTTLE",
          "aliasName": "ACTIVE TOILET CLEANER",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "30.5",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100573"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE BATHROOM  CLEANER 500ml BOTTLE",
          "aliasName": "TOTAL CARE BATHROOM  CLEANER 500ml BOTTLE",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "33",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100549"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE TILES CLEANER 500ml BOTTLE",
          "aliasName": "TOTAL CARE TILES CLEANER 500ml BOTTLE",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "30",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100550"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE PLUS TOILET CLEANER 1Ltr REFILL PACK",
          "aliasName": "TOILET CLEANER 1Ltr",
          "mrp": "120",
          "discount": "50",
          "sellingPrice": "60",
          "wholeSalePrice": "35",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100574"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE (XL-BLUE) DETERGENT CAKE (200g X 10pcs) 2KGS",
          "aliasName": "TOTAL CARE (XL-BLUE) DETERGENT CAKE (200g X 10pcs) 2KGS",
          "mrp": "100",
          "discount": "20",
          "sellingPrice": "80",
          "wholeSalePrice": "77",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100551"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE (XL-WHITE) DETERGENT CAKE (200g X 10pcs) 2KGS",
          "aliasName": "TOTAL CARE (XL-WHITE) DETERGENT CAKE (200g X 10pcs) 2KGS",
          "mrp": "100",
          "discount": "20",
          "sellingPrice": "80",
          "wholeSalePrice": "77",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100552"
      },
      {
          "productType": "finished",
          "productName": "BARTAN TUKDA 1KGS",
          "aliasName": "BARTAN TUKDA 1KGS",
          "mrp": "45",
          "discount": "22.22",
          "sellingPrice": "35",
          "wholeSalePrice": "26",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100554"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE DWB (200g X 10pcs) 2KGS",
          "aliasName": "TOTAL CARE DWB (200g X 10pcs) 2KGS",
          "mrp": "90",
          "discount": "22.22",
          "sellingPrice": "70",
          "wholeSalePrice": "53",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100553"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE BLEACH 1 LTR CANE",
          "aliasName": "TOTAL CARE BLEACH 1 LTR CANE",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "24",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100556"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE GERM PROTECTION HANDWASH- ROSE 1ltr BOTTLE",
          "aliasName": "TOTAL CARE GERM PROTECTION HANDWASH- ROSE 1ltr BOTTLE",
          "mrp": "120",
          "discount": "33.33",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100558"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE GERM PROTECTION HANDWASH- LEMON 1ltr BOTTLE",
          "aliasName": "TOTAL CARE GERM PROTECTION HANDWASH- LEMON 1ltr BOTTLE",
          "mrp": "120",
          "discount": "33.33",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100559"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE GERM PROTECTION HANDWASH- ORANGE 1ltr BOTTLE",
          "aliasName": "TOTAL CARE GERM PROTECTION HANDWASH- ORANGE 1ltr BOTTLE",
          "mrp": "120",
          "discount": "33.33",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100560"
      },
      {
          "productType": "finished",
          "productName": "Chinki Active Detergent Powder 1kg",
          "aliasName": "Chinki Active Detergent Powder 1kg",
          "mrp": "40",
          "discount": "0",
          "sellingPrice": "40",
          "wholeSalePrice": "37",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100179"
      },
      {
          "productType": "finished",
          "productName": "Chinki Shakti Detergent Powder 1kg",
          "aliasName": "Chinki Shakti Detergent Powder 1kg",
          "mrp": "50",
          "discount": "0",
          "sellingPrice": "50",
          "wholeSalePrice": "45",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100180"
      },
      {
          "productType": "finished",
          "productName": "Chinki Advance Detergent Powder 1kg",
          "aliasName": "Chinki Advance Detergent Powder 1kg",
          "mrp": "60",
          "discount": "0",
          "sellingPrice": "60",
          "wholeSalePrice": "54",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100181"
      },
      {
          "productType": "finished",
          "productName": "Chinki Supreme Detergent Powder 1kg",
          "aliasName": "Chinki Supreme Detergent Powder 1kg",
          "mrp": "90",
          "discount": "11.11",
          "sellingPrice": "80",
          "wholeSalePrice": "72",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100507"
      },
      {
          "productType": "finished",
          "productName": "Chinki Active DWB 200g (200gX5pcs)",
          "aliasName": "Chinki Active DWB 200g (200gX5pcs)",
          "mrp": "40",
          "discount": "0",
          "sellingPrice": "40",
          "wholeSalePrice": "39",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100260"
      },
      {
          "productType": "finished",
          "productName": "Chinki Shakti DWB 195g (200gX5pcs)",
          "aliasName": "Chinki Shakti DWB 195g (200gX5pcs)",
          "mrp": "60",
          "discount": "8.33",
          "sellingPrice": "55",
          "wholeSalePrice": "50",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100308"
      },
      {
          "productType": "finished",
          "productName": "Chinki Active Blue Detergent Cake 150g (150gX6pcs)",
          "aliasName": "Chinki Active Blue Detergent Cake 150g (150gX6pcs)",
          "mrp": "40",
          "discount": "12.5",
          "sellingPrice": "35",
          "wholeSalePrice": "35",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100302"
      },
      {
          "productType": "finished",
          "productName": "Chinki Shakti Blue  Detergent Cake 200g (200gX5pcs)",
          "aliasName": "Chinki Shakti Blue  Detergent Cake 200g (200gX5pcs)",
          "mrp": "60",
          "discount": "25",
          "sellingPrice": "45",
          "wholeSalePrice": "42",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100309"
      },
      {
          "productType": "finished",
          "productName": "Chinki Shakti White Detergent Cake  200g (200gX5pcs)",
          "aliasName": "Chinki Shakti White Detergent Cake  200g (200gX5pcs)",
          "mrp": "50",
          "discount": "10",
          "sellingPrice": "45",
          "wholeSalePrice": "42",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100310"
      },
      {
          "productType": "finished",
          "productName": "Chinki Shakti Top Load Detergent Liquid 1ltr Bottle",
          "aliasName": "Chinki Shakti Top Load Detergent Liquid 1ltr Bottle",
          "mrp": "200",
          "discount": "30",
          "sellingPrice": "140",
          "wholeSalePrice": "122",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100306"
      },
      {
          "productType": "finished",
          "productName": "Chinki Shakti Top Load Detergent Liquid 3ltr Cane",
          "aliasName": "Chinki Shakti Top Load Detergent Liquid 3ltr Cane",
          "mrp": "540",
          "discount": "35.19",
          "sellingPrice": "350",
          "wholeSalePrice": "284",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100516"
      },
      {
          "productType": "finished",
          "productName": "Chinki Shakti Front Load Detergent Liquid 1ltr Bottle",
          "aliasName": "Chinki Shakti Front Load Detergent Liquid 1ltr Bottle",
          "mrp": "220",
          "discount": "27.27",
          "sellingPrice": "160",
          "wholeSalePrice": "125",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100460"
      },
      {
          "productType": "finished",
          "productName": "Chinki Shakti Front Load Detergent Liquid 3ltr Cane",
          "aliasName": "Chinki Shakti Front Load Detergent Liquid 3ltr Cane",
          "mrp": "600",
          "discount": "31.67",
          "sellingPrice": "410",
          "wholeSalePrice": "291",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100517"
      },
      {
          "productType": "finished",
          "productName": "Chinki Active 3 in 1 Liquid 1ltr Bottle",
          "aliasName": "CHINKI 3 IN 1 LIQUID",
          "mrp": "100",
          "discount": "20",
          "sellingPrice": "80",
          "wholeSalePrice": "65",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100358"
      },
      {
          "productType": "finished",
          "productName": "Chinki Shakti Dishwash Liquid 500ml Bottle",
          "aliasName": "Chinki Shakti Dishwash Liquid 500ml Bottle",
          "mrp": "75",
          "discount": "13.33",
          "sellingPrice": "65",
          "wholeSalePrice": "47",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100304"
      },
      {
          "productType": "finished",
          "productName": "Chinki Shakti Dishwash Liquid 1ltr Refill Pack",
          "aliasName": "Chinki Shakti Dishwash Liquid 1ltr Refill Pack",
          "mrp": "150",
          "discount": "26.67",
          "sellingPrice": "110",
          "wholeSalePrice": "74",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100499"
      },
      {
          "productType": "finished",
          "productName": "Chinki Star Dishwash Liquid 1ltr Bottle",
          "aliasName": "Chinki Star Dishwash Liquid 1ltr Bottle",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "49",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100368"
      },
      {
          "productType": "finished",
          "productName": "Chinki Toilet Bowl Cleaner 500ml Bottle",
          "aliasName": "Chinki Toilet Bowl Cleaner 500ml Bottle",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "32",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100461"
      },
      {
          "productType": "finished",
          "productName": "Chinki Glass & Multisurface Cleaner 500ml Bottle",
          "aliasName": "Chinki Glass & Multisurface Cleaner 500ml Bottle",
          "mrp": "80",
          "discount": "25",
          "sellingPrice": "60",
          "wholeSalePrice": "41",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100557"
      },
      {
          "productType": "finished",
          "productName": "Chinki Multisurface Cleaner- Refresh 500ml Bottle",
          "aliasName": "Chinki Multisurface Cleaner- Refresh 500ml Bottle",
          "mrp": "90",
          "discount": "22.22",
          "sellingPrice": "70",
          "wholeSalePrice": "56",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100510"
      },
      {
          "productType": "finished",
          "productName": "Chinki Multisurface Cleaner- Refresh 1ltr Bottle",
          "aliasName": "Chinki Multisurface Cleaner- Refresh 1ltr Bottle",
          "mrp": "170",
          "discount": "23.53",
          "sellingPrice": "130",
          "wholeSalePrice": "93",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100360"
      },
      {
          "productType": "finished",
          "productName": "Chinki Multisurface Cleaner- Refresh 3ltr Cane",
          "aliasName": "Chinki Multisurface Cleaner- Refresh 3ltr Cane",
          "mrp": "465",
          "discount": "26.88",
          "sellingPrice": "340",
          "wholeSalePrice": "255",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100518"
      },
      {
          "productType": "finished",
          "productName": "Chinki Multisurface Cleaner- Lemon Fresh 500ml Bottle",
          "aliasName": "Chinki Multisurface Cleaner- Lemon Fresh 500ml Bottle",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "48",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100361"
      },
      {
          "productType": "finished",
          "productName": "Chinki Multisurface Cleaner- Lemon Fresh 1Ltr Bottle",
          "aliasName": "CHINKI LEMON 1 LTR",
          "mrp": "120",
          "discount": "16.67",
          "sellingPrice": "100",
          "wholeSalePrice": "76",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100366"
      },
      {
          "productType": "finished",
          "productName": "Chinki Skin Care Soap 100g (1 Pcs)",
          "aliasName": "Chinki Skin Care Soap 100g (1 Pcs)",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "28",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100509"
      },
      {
          "productType": "finished",
          "productName": "Chinki Skin Care Soap 100g (4 Pcs)",
          "aliasName": "SkinCare 100g (4 Pcs)",
          "mrp": "150",
          "discount": "33.33",
          "sellingPrice": "100",
          "wholeSalePrice": "85",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100590"
      },
      {
          "productType": "finished",
          "productName": "Chinki Germ Protection Hand Wash Cambo (1ltr+250ml)",
          "aliasName": "Hand Wash Cambo",
          "mrp": "240",
          "discount": "33.33",
          "sellingPrice": "160",
          "wholeSalePrice": "80",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100591"
      },
      {
          "productType": "finished",
          "productName": "Chinki Germ Protection Hand Wash 250ml",
          "aliasName": "Chinki Germ Protection Hand Wash 250ml",
          "mrp": "80",
          "discount": "25",
          "sellingPrice": "60",
          "wholeSalePrice": "54",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100514"
      },
      {
          "productType": "finished",
          "productName": "Chinki Germ Protection Hand Wash - Refill Pack 1 ltr",
          "aliasName": "Chinki Germ Protection Hand Wash - Refill Pack 1 ltr",
          "mrp": "160",
          "discount": "25",
          "sellingPrice": "120",
          "wholeSalePrice": "107",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100515"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE LP-BLUE DETERGENT CAKE 2KGS",
          "aliasName": "LP-BLUE",
          "mrp": "90",
          "discount": "33.33",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100592"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE ADVANCE DET POWDER 1 KG",
          "aliasName": "TC ADV POWDER",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "45",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100593"
      },
      {
          "productType": "finished",
          "productName": "SUNNY ACTIVE SHINE 200 ml",
          "aliasName": "SUNNY ACTIVE SHINE 200 ml",
          "mrp": "50",
          "discount": "20",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "38089400",
          "gst": "18",
          "barcode": "8908002637069"
      },
      {
          "productType": "finished",
          "productName": "BUCKET 13 LTR",
          "aliasName": "BUCKET 13 LTR",
          "mrp": "0",
          "discount": "0",
          "sellingPrice": "0",
          "wholeSalePrice": "0",
          "hsnCode": "39249090",
          "gst": "18",
          "barcode": "100100100700"
      },
      {
          "productType": "finished",
          "productName": "BUCKET 16 LTR",
          "aliasName": "BUCKET 16 LTR",
          "mrp": "0",
          "discount": "0",
          "sellingPrice": "0",
          "wholeSalePrice": "0",
          "hsnCode": "39249090",
          "gst": "18",
          "barcode": "100100100701"
      },
      {
          "productType": "finished",
          "productName": "TUB",
          "aliasName": "TUB",
          "mrp": "150",
          "discount": "0",
          "sellingPrice": "150",
          "wholeSalePrice": "150",
          "hsnCode": "",
          "gst": "0",
          "barcode": "100100100702"
      },
      {
          "productType": "finished",
          "productName": "PATLA",
          "aliasName": "PATLA",
          "mrp": "205",
          "discount": "51.22",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100703"
      },
      {
          "productType": "finished",
          "productName": "WHITE BUCKET 16 LTR",
          "aliasName": "WHITE BUCKET 16 LTR",
          "mrp": "250",
          "discount": "0",
          "sellingPrice": "250",
          "wholeSalePrice": "250",
          "hsnCode": "",
          "gst": "0",
          "barcode": "100100100704"
      },
      {
          "productType": "finished",
          "productName": "PITAMBARI POWDER 50gm",
          "aliasName": "PITAMBARI POWDER 50gm",
          "mrp": "28",
          "discount": "10.71",
          "sellingPrice": "25",
          "wholeSalePrice": "25",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "8901468110732"
      },
      {
          "productType": "finished",
          "productName": "NATURAL CONCEPT AMLA SIKAKAI 1 LTR SHAMPOO",
          "aliasName": "AMLA SHAMPOO",
          "mrp": "250",
          "discount": "50",
          "sellingPrice": "125",
          "wholeSalePrice": "100",
          "hsnCode": "33051000",
          "gst": "18",
          "barcode": "8904304752004"
      },
      {
          "productType": "finished",
          "productName": "NATURAL CONCEPT ALOVERA GREEN 1 LTR SHAMPOO",
          "aliasName": "GREEN SHAMPOO",
          "mrp": "250",
          "discount": "50",
          "sellingPrice": "125",
          "wholeSalePrice": "100",
          "hsnCode": "33051000",
          "gst": "18",
          "barcode": "100100100595"
      },
      {
          "productType": "finished",
          "productName": "HAND SANITIZER 500 ml",
          "aliasName": "HAND SANITIZER 500 ml",
          "mrp": "250",
          "discount": "48",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "34021190",
          "gst": "18",
          "barcode": "8904304750895"
      },
      {
          "productType": "finished",
          "productName": "NATURAL CONCEPT ALOVERA WHITE 1 LTR SHAMPOO",
          "aliasName": "WHITE SHAMPOO 1 LTR",
          "mrp": "250",
          "discount": "50",
          "sellingPrice": "125",
          "wholeSalePrice": "100",
          "hsnCode": "33051000",
          "gst": "18",
          "barcode": "8904304751991"
      },
      {
          "productType": "finished",
          "productName": "GH SCRUB 2 IN 1",
          "aliasName": "GH SCRUB 2 IN 1",
          "mrp": "30",
          "discount": "16.67",
          "sellingPrice": "25",
          "wholeSalePrice": "25",
          "hsnCode": "68053000",
          "gst": "18",
          "barcode": "8902618000507"
      },
      {
          "productType": "finished",
          "productName": "GH SCRUB XTRA TOUGH RED",
          "aliasName": "GH SCRUB XTRA TOUGH RED",
          "mrp": "30",
          "discount": "16.67",
          "sellingPrice": "25",
          "wholeSalePrice": "25",
          "hsnCode": "68053000",
          "gst": "18",
          "barcode": "8902618000736"
      },
      {
          "productType": "finished",
          "productName": "GH SCRUB REGULAR LARGE",
          "aliasName": "GH SCRUB REGULAR LARGE",
          "mrp": "30",
          "discount": "16.67",
          "sellingPrice": "25",
          "wholeSalePrice": "25",
          "hsnCode": "68053000",
          "gst": "18",
          "barcode": "8902618000729"
      },
      {
          "productType": "finished",
          "productName": "GH DRAIN CLEANER 50 GM",
          "aliasName": "GH DRAIN CLEANER 50 GM",
          "mrp": "25",
          "discount": "20",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "34022090",
          "gst": "18",
          "barcode": "8902618000613"
      },
      {
          "productType": "finished",
          "productName": "GH SCRUB TOUGH",
          "aliasName": "GH SCRUB TOUGH",
          "mrp": "10",
          "discount": "0",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "68053000",
          "gst": "18",
          "barcode": "8902618013347"
      },
      {
          "productType": "finished",
          "productName": "NATURAL CONCEPT ALOVERA WHITE SHAMPOO 500 ml",
          "aliasName": "ALOVERA 500 ml",
          "mrp": "200",
          "discount": "65",
          "sellingPrice": "70",
          "wholeSalePrice": "60",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100597"
      },
      {
          "productType": "finished",
          "productName": "GH SCRUB STEEL",
          "aliasName": "GH SCRUB STEEL",
          "mrp": "15",
          "discount": "33.33",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "68053000",
          "gst": "18",
          "barcode": "8902618012203"
      },
      {
          "productType": "finished",
          "productName": "GH AIR FRESHNERS CITRUS",
          "aliasName": "GH AIR FRESHNERS CITRUS",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074900",
          "gst": "18",
          "barcode": "8902618012166"
      },
      {
          "productType": "finished",
          "productName": "GH AIR FRESHNER JASMINE",
          "aliasName": "GH AIR FRESHNER JASMINE",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074900",
          "gst": "18",
          "barcode": "8902618012159"
      },
      {
          "productType": "finished",
          "productName": "GH AIR FRESHNER LAVENDER",
          "aliasName": "GH AIR FRESHNER LAVENDER",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074900",
          "gst": "18",
          "barcode": "8902618012142"
      },
      {
          "productType": "finished",
          "productName": "GH AIR FRESHNER ROSE",
          "aliasName": "GH AIR FRESHNER ROSE",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074900",
          "gst": "18",
          "barcode": "8902618012135"
      },
      {
          "productType": "finished",
          "productName": "CITY WHITE BATH SOAP 75 G",
          "aliasName": "CITY WHITE SOAP",
          "mrp": "170",
          "discount": "17.65",
          "sellingPrice": "140",
          "wholeSalePrice": "140",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100601"
      },
      {
          "productType": "finished",
          "productName": "CITY PINK BATH SOAP 75 G",
          "aliasName": "CITY PINK SOAP",
          "mrp": "170",
          "discount": "17.65",
          "sellingPrice": "140",
          "wholeSalePrice": "140",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100602"
      },
      {
          "productType": "finished",
          "productName": "CITY SANDAL BATH SOAP 75 G",
          "aliasName": "CITY SANDAL SOAP",
          "mrp": "170",
          "discount": "17.65",
          "sellingPrice": "140",
          "wholeSalePrice": "140",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100603"
      },
      {
          "productType": "finished",
          "productName": "CITY HERBAL BATH SOAP 75 G",
          "aliasName": "CITY HERBAL SOAP",
          "mrp": "170",
          "discount": "17.65",
          "sellingPrice": "140",
          "wholeSalePrice": "140",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100604"
      },
      {
          "productType": "finished",
          "productName": "CITY LIME BATH SOAP 75 G",
          "aliasName": "CITY LIME SOAP",
          "mrp": "170",
          "discount": "17.65",
          "sellingPrice": "140",
          "wholeSalePrice": "140",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100605"
      },
      {
          "productType": "finished",
          "productName": "ALOVERA GEL 500 GMS",
          "aliasName": "ALOVERA GEL 500 GMS",
          "mrp": "250",
          "discount": "20",
          "sellingPrice": "200",
          "wholeSalePrice": "150",
          "hsnCode": "34011190",
          "gst": "18",
          "barcode": "8904304750178"
      },
      {
          "productType": "finished",
          "productName": "ALOVERA GEL 150 GMS",
          "aliasName": "ALOVERA GEL 150 GMS",
          "mrp": "120",
          "discount": "25",
          "sellingPrice": "90",
          "wholeSalePrice": "70",
          "hsnCode": "34011190",
          "gst": "18",
          "barcode": "8904304750123"
      },
      {
          "productType": "finished",
          "productName": "CITY TRANSPARENT BATH SOAP 100 G",
          "aliasName": "CITY TRANSPARENT SOAP",
          "mrp": "170",
          "discount": "29.41",
          "sellingPrice": "120",
          "wholeSalePrice": "120",
          "hsnCode": "34011190",
          "gst": "18",
          "barcode": "100100100606"
      },
      {
          "productType": "estimated",
          "productName": "HRJ ORANGE MOP",
          "aliasName": "HRJ ORANGE MOP",
          "mrp": "275",
          "discount": "67.27",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280481"
      },
      {
          "productType": "estimated",
          "productName": "HRJ BLUE MOP",
          "aliasName": "HRJ BLUE MOP",
          "mrp": "275",
          "discount": "60",
          "sellingPrice": "110",
          "wholeSalePrice": "110",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280482"
      },
      {
          "productType": "estimated",
          "productName": "FIVE G ROUND MOP",
          "aliasName": "FIVE G ROUND MOP",
          "mrp": "199",
          "discount": "54.77",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280483"
      },
      {
          "productType": "estimated",
          "productName": "HRJ ROUND MOP",
          "aliasName": "HRJ ROUND MOP",
          "mrp": "155",
          "discount": "48.39",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280484"
      },
      {
          "productType": "estimated",
          "productName": "WIPER",
          "aliasName": "WIPER",
          "mrp": "140",
          "discount": "50",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280485"
      },
      {
          "productType": "estimated",
          "productName": "NAPTHALENE BALLS 100 G",
          "aliasName": "NAPTHALENE 100 gm",
          "mrp": "40",
          "discount": "25",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280492"
      },
      {
          "productType": "estimated",
          "productName": "BULBUL CLOTH CLIP",
          "aliasName": "BULBUL CLOTH CLIP",
          "mrp": "105",
          "discount": "42.86",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280487"
      },
      {
          "productType": "estimated",
          "productName": "CLOTH CLIPS BIG",
          "aliasName": "CLOTH CLIPS BIG",
          "mrp": "40",
          "discount": "25",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280488"
      },
      {
          "productType": "estimated",
          "productName": "PLASTIC SCRUBBER",
          "aliasName": "PLASTIC SCRUBBER",
          "mrp": "15",
          "discount": "33.33",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280486"
      },
      {
          "productType": "estimated",
          "productName": "KISSAN CLOTH SMALL",
          "aliasName": "CLOTH SMALL",
          "mrp": "20",
          "discount": "50",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280489"
      },
      {
          "productType": "estimated",
          "productName": "KISSAN CLOTH BIG",
          "aliasName": "KISSAN CLOTH BIG",
          "mrp": "25",
          "discount": "40",
          "sellingPrice": "15",
          "wholeSalePrice": "15",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280490"
      },
      {
          "productType": "estimated",
          "productName": "DUSTER 20 X 20",
          "aliasName": "DUSTER 20 X 20",
          "mrp": "30",
          "discount": "33.33",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280491"
      },
      {
          "productType": "estimated",
          "productName": "NOVA WIPER",
          "aliasName": "NOVA WIPER",
          "mrp": "300",
          "discount": "50",
          "sellingPrice": "150",
          "wholeSalePrice": "150",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280493"
      },
      {
          "productType": "estimated",
          "productName": "AXES WIPER",
          "aliasName": "AXES WIPER",
          "mrp": "170",
          "discount": "47.06",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280494"
      },
      {
          "productType": "estimated",
          "productName": "SILICON WIPER",
          "aliasName": "SILICON WIPER",
          "mrp": "270",
          "discount": "37.04",
          "sellingPrice": "170",
          "wholeSalePrice": "170",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280547"
      },
      {
          "productType": "estimated",
          "productName": "SHAGUN WIPER",
          "aliasName": "SHAGUN WIPER",
          "mrp": "99",
          "discount": "19.19",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904238000905"
      },
      {
          "productType": "estimated",
          "productName": "FLORA MOP",
          "aliasName": "FLORA MOP",
          "mrp": "190",
          "discount": "47.37",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280495"
      },
      {
          "productType": "estimated",
          "productName": "WINNER MOP",
          "aliasName": "WINNER MOP",
          "mrp": "160",
          "discount": "50",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280496"
      },
      {
          "productType": "estimated",
          "productName": "MARI GOLD MOP",
          "aliasName": "MARI GOLD MOP",
          "mrp": "240",
          "discount": "45.83",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280497"
      },
      {
          "productType": "estimated",
          "productName": "SAMARTHYA ROUND MOP COMBO",
          "aliasName": "SAMARTHYA COMBO",
          "mrp": "600",
          "discount": "51.67",
          "sellingPrice": "290",
          "wholeSalePrice": "290",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280500"
      },
      {
          "productType": "finished",
          "productName": "SUNNY ACTIVE SHINE 500 ML",
          "aliasName": "SUNNY ACTIVE SHINE 500 ML",
          "mrp": "120",
          "discount": "25",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "38089400",
          "gst": "18",
          "barcode": "8908002637120"
      },
      {
          "productType": "estimated",
          "productName": "LIBERTY PIPE CLOTH CLIP",
          "aliasName": "LIBERTY CLIP",
          "mrp": "70",
          "discount": "42.86",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906042070112"
      },
      {
          "productType": "estimated",
          "productName": "DUSTER 22 X 22",
          "aliasName": "DUSTER 22 X 22",
          "mrp": "40",
          "discount": "37.5",
          "sellingPrice": "25",
          "wholeSalePrice": "25",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280498"
      },
      {
          "productType": "estimated",
          "productName": "CHOKDI CLOTH BIG",
          "aliasName": "CHOKDI CLOTH BIG",
          "mrp": "25",
          "discount": "40",
          "sellingPrice": "15",
          "wholeSalePrice": "15",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280499"
      },
      {
          "productType": "estimated",
          "productName": "SAMARTHYA BUCKET SPIN MOP (PLASTIC)",
          "aliasName": "SAMARTHYA BUCKET SPIN MOP",
          "mrp": "1249",
          "discount": "39.95",
          "sellingPrice": "750",
          "wholeSalePrice": "750",
          "hsnCode": "",
          "gst": "18",
          "barcode": "9898618098059"
      },
      {
          "productType": "estimated",
          "productName": "SAMARTHYA PIPE 360 DEGREE",
          "aliasName": "SAMARTHYA PIPE 360 DEGREE",
          "mrp": "399",
          "discount": "62.41",
          "sellingPrice": "150",
          "wholeSalePrice": "150",
          "hsnCode": "",
          "gst": "18",
          "barcode": "9898618098028"
      },
      {
          "productType": "estimated",
          "productName": "SAMARTHYA DISH WITH REFILL",
          "aliasName": "SAMARTHYA DISH",
          "mrp": "299",
          "discount": "36.45",
          "sellingPrice": "190",
          "wholeSalePrice": "190",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280501"
      },
      {
          "productType": "estimated",
          "productName": "I CLEAN MOP",
          "aliasName": "I CLEAN MOP",
          "mrp": "190",
          "discount": "36.84",
          "sellingPrice": "120",
          "wholeSalePrice": "120",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280507"
      },
      {
          "productType": "estimated",
          "productName": "ROSE MOP",
          "aliasName": "ROSE MOP",
          "mrp": "210",
          "discount": "47.62",
          "sellingPrice": "110",
          "wholeSalePrice": "110",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280508"
      },
      {
          "productType": "estimated",
          "productName": "KITCHEN WIPER",
          "aliasName": "KITCHEN WIPER",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280516"
      },
      {
          "productType": "finished",
          "productName": "CHINKI HI-FI MULTI SURFACE CLEANER 1 LTR BOTTLE",
          "aliasName": "CHINKI HI-FI MULTI SURFACE CLEANER 1 LTR BOTTLE",
          "mrp": "170",
          "discount": "29.41",
          "sellingPrice": "120",
          "wholeSalePrice": "92",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100359"
      },
      {
          "productType": "estimated",
          "productName": "STYLX SOAP",
          "aliasName": "STYLX SOAP",
          "mrp": "180",
          "discount": "22.22",
          "sellingPrice": "140",
          "wholeSalePrice": "140",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280505"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ ACTIVE FABRIC CONDITIONER BLUE",
          "aliasName": "ZYKZ ACTIVE FABRIC CONDITIONER BLUE",
          "mrp": "150",
          "discount": "40",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100607"
      },
      {
          "productType": "estimated",
          "productName": "JELLY",
          "aliasName": "JELLY",
          "mrp": "100",
          "discount": "15",
          "sellingPrice": "85",
          "wholeSalePrice": "85",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280502"
      },
      {
          "productType": "finished",
          "productName": "LAXMANREKHAA",
          "aliasName": "LAXMANREKHAA",
          "mrp": "16",
          "discount": "6.25",
          "sellingPrice": "15",
          "wholeSalePrice": "15",
          "hsnCode": "38089910",
          "gst": "18",
          "barcode": "8904058700377"
      },
      {
          "productType": "finished",
          "productName": "BLEACHING POWDER",
          "aliasName": "BLEACHING POWDER",
          "mrp": "90",
          "discount": "33.33",
          "sellingPrice": "60",
          "wholeSalePrice": "40",
          "hsnCode": "28281010",
          "gst": "18",
          "barcode": "100100100608"
      },
      {
          "productType": "finished",
          "productName": "SP-150 ( 4 KG DETERGENT POWDER)",
          "aliasName": "SP-150 ( 4 KG DET POWDER)",
          "mrp": "200",
          "discount": "25",
          "sellingPrice": "150",
          "wholeSalePrice": "136",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100609"
      },
      {
          "productType": "finished",
          "productName": "SP-200 ( 4 KG DETERGENT POWDER)",
          "aliasName": "SP-200 ( 4 KG DET POWDER)",
          "mrp": "250",
          "discount": "20",
          "sellingPrice": "200",
          "wholeSalePrice": "157",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100610"
      },
      {
          "productType": "finished",
          "productName": "SP-250 ( 4 KG DETERGENT POWDER)",
          "aliasName": "SP-250 ( 4 KG DET POWDER)",
          "mrp": "400",
          "discount": "37.5",
          "sellingPrice": "250",
          "wholeSalePrice": "225",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100611"
      },
      {
          "productType": "estimated",
          "productName": "Loose Cloth Clips",
          "aliasName": "CLOTH CLIPS",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280503"
      },
      {
          "productType": "finished",
          "productName": "TOILET CLEANER 5 Ltr JAR",
          "aliasName": "TOILET CLEANER 5 Ltr JAR",
          "mrp": "500",
          "discount": "50",
          "sellingPrice": "250",
          "wholeSalePrice": "120",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100612"
      },
      {
          "productType": "estimated",
          "productName": "MOP ROD",
          "aliasName": "MOP ROD",
          "mrp": "60",
          "discount": "50",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280519"
      },
      {
          "productType": "estimated",
          "productName": "NAPTHALENE BALLS 250 G",
          "aliasName": "NAPTHALENE 250gm",
          "mrp": "100",
          "discount": "40",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280504"
      },
      {
          "productType": "estimated",
          "productName": "SCON SOAP",
          "aliasName": "SCON SOAP",
          "mrp": "180",
          "discount": "16.67",
          "sellingPrice": "150",
          "wholeSalePrice": "150",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280506"
      },
      {
          "productType": "estimated",
          "productName": "TRANSPARENT BATH SOAP 10 pcs",
          "aliasName": "TRANSPARENT 10 PCS",
          "mrp": "340",
          "discount": "44.12",
          "sellingPrice": "190",
          "wholeSalePrice": "190",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280462"
      },
      {
          "productType": "estimated",
          "productName": "TRANSPARENT BATH SOAP 5 pcs",
          "aliasName": "TRANSPARENT 5 pcs",
          "mrp": "170",
          "discount": "41.18",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280463"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE ADVANCE DISHWASH LIQUID YELLOW 1 Ltr",
          "aliasName": "ADVANCE DW 1 LTR",
          "mrp": "110",
          "discount": "36.36",
          "sellingPrice": "70",
          "wholeSalePrice": "65",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100613"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE ADVANCE DISHWASH LIQUID GREEN 1 Ltr",
          "aliasName": "ADVANCE DW GREEN 1 LTR",
          "mrp": "110",
          "discount": "36.36",
          "sellingPrice": "70",
          "wholeSalePrice": "65",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100614"
      },
      {
          "productType": "estimated",
          "productName": "KHARATA JHADU",
          "aliasName": "KHARATA JHADU",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280509"
      },
      {
          "productType": "estimated",
          "productName": "LAXMI GRASS BROOM RED",
          "aliasName": "LAXMI GRASS BROOM RED",
          "mrp": "190",
          "discount": "36.84",
          "sellingPrice": "120",
          "wholeSalePrice": "120",
          "hsnCode": "",
          "gst": "0",
          "barcode": "816904280510"
      },
      {
          "productType": "estimated",
          "productName": "ZYKZ GW ROSE",
          "aliasName": "ZYKZ GW ROSE",
          "mrp": "120",
          "discount": "41.67",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280511"
      },
      {
          "productType": "estimated",
          "productName": "GARBAGE BAG 19 X 21",
          "aliasName": "GARBAGE BAG 19 X 21",
          "mrp": "76",
          "discount": "60.53",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280512"
      },
      {
          "productType": "estimated",
          "productName": "CLOTH BRUSH",
          "aliasName": "CLOTH BRUSH",
          "mrp": "60",
          "discount": "50",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280513"
      },
      {
          "productType": "estimated",
          "productName": "ZYKZ GW ORANGE POWER",
          "aliasName": "ZYKZ GW ORANGE POWER",
          "mrp": "120",
          "discount": "41.67",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280514"
      },
      {
          "productType": "estimated",
          "productName": "XTRA LONG BROOM",
          "aliasName": "XL BROOM",
          "mrp": "200",
          "discount": "40",
          "sellingPrice": "120",
          "wholeSalePrice": "120",
          "hsnCode": "",
          "gst": "0",
          "barcode": "816904280520"
      },
      {
          "productType": "finished",
          "productName": "GARDEN INCENSE STICK 300g",
          "aliasName": "GARDEN INCENSE STICK 300g",
          "mrp": "140",
          "discount": "21.43",
          "sellingPrice": "110",
          "wholeSalePrice": "110",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906090814799"
      },
      {
          "productType": "finished",
          "productName": "OUDH INCENSE STICK 120g",
          "aliasName": "OUDH INCENSE STICK 120g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906090814096"
      },
      {
          "productType": "finished",
          "productName": "MUSK INCENSE STICK 125g",
          "aliasName": "MUSK INCENSE STICK 125g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906090814041"
      },
      {
          "productType": "finished",
          "productName": "FOR EVER INCENSE STICK 125g",
          "aliasName": "FOR EVER INCENSE STICK 125g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906090816199"
      },
      {
          "productType": "finished",
          "productName": "SUNFLOWER INCENSE STICK 125g",
          "aliasName": "SUNFLOWER INCENSE STICK 125g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906090816182"
      },
      {
          "productType": "finished",
          "productName": "CARNIVAL INCENSE STICK 125g",
          "aliasName": "CARNIVAL INCENSE STICK 125g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906090813136"
      },
      {
          "productType": "finished",
          "productName": "PINEAPPLE INCENSE STICJK 200g",
          "aliasName": "PINEAPPLE 200g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906090811217"
      },
      {
          "productType": "finished",
          "productName": "NATURAL WOODS INCENSE STICK 125g",
          "aliasName": "NATURAL WOODS INCENSE STICK 125g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906090815215"
      },
      {
          "productType": "finished",
          "productName": "GOLDEN INCENSE STICKS",
          "aliasName": "GOLDEN INCENSE STICKS",
          "mrp": "140",
          "discount": "21.43",
          "sellingPrice": "110",
          "wholeSalePrice": "110",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906090813181"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ ACTIVE FABRIC CONDITIONER PINK",
          "aliasName": "ZYKZ ACTIVE FABRIC CONDITIONER PINK",
          "mrp": "150",
          "discount": "40",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100615"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ PLUS GENTLE CLEAN BLUE 1 LTR",
          "aliasName": "ZYKZ PLUS GENTLE CLEAN BLUE 1 LTR",
          "mrp": "180",
          "discount": "50",
          "sellingPrice": "90",
          "wholeSalePrice": "67",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100616"
      },
      {
          "productType": "finished",
          "productName": "NATURAL CONCEPT BODY LOTION 200 ml",
          "aliasName": "NC Moisturizing Body Lotion",
          "mrp": "180",
          "discount": "44.44",
          "sellingPrice": "100",
          "wholeSalePrice": "85",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100617"
      },
      {
          "productType": "estimated",
          "productName": "CLOTH BRUSH BIG",
          "aliasName": "CLOTH BRUSH BIG",
          "mrp": "70",
          "discount": "42.86",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280541"
      },
      {
          "productType": "estimated",
          "productName": "zykz plus gentle clean 1ltr",
          "aliasName": "zykz plus gentle clean 1ltr",
          "mrp": "180",
          "discount": "50",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280515"
      },
      {
          "productType": "estimated",
          "productName": "SCALEOUT  CLEANER",
          "aliasName": "SCALEOUT  CLEANER",
          "mrp": "190",
          "discount": "73.68",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280543"
      },
      {
          "productType": "estimated",
          "productName": "TOILET BRUSH ONE SIDE",
          "aliasName": "TOILET BRUSH ONE SIDE",
          "mrp": "60",
          "discount": "33.33",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280521"
      },
      {
          "productType": "estimated",
          "productName": "TOILET BRUSH BOTH SIDE",
          "aliasName": "TOILET .B.BOTH SIDE",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280522"
      },
      {
          "productType": "finished",
          "productName": "TEST BARCODE",
          "aliasName": "TEST BARCODE",
          "mrp": "100",
          "discount": "0",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "0",
          "barcode": "100"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ GENTLE WASH ORANGE POWER",
          "aliasName": "ZYKZ GENTLE WASH ORANGE POWER",
          "mrp": "120",
          "discount": "41.67",
          "sellingPrice": "70",
          "wholeSalePrice": "46",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100620"
      },
      {
          "productType": "estimated",
          "productName": "DUST BIN",
          "aliasName": "DUST BIN",
          "mrp": "300",
          "discount": "50",
          "sellingPrice": "150",
          "wholeSalePrice": "150",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158100116"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ GENTLE WASH ROSE",
          "aliasName": "ZYKZ GENTLE WASH ROSE",
          "mrp": "120",
          "discount": "41.67",
          "sellingPrice": "70",
          "wholeSalePrice": "46",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100619"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ LUSH GENTLE CLEAN LIQUID 1 LTR",
          "aliasName": "ZYKZ LUSH GENTLE CLEAN LIQUID 1 LTR",
          "mrp": "220",
          "discount": "50",
          "sellingPrice": "110",
          "wholeSalePrice": "79",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100618"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ PLUS GENTLE CLEAN BLUE 250 ml",
          "aliasName": "GENTLE CLEAN BLUE",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "23",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100622"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ LUSH GENTLE CLEAN 250 ml",
          "aliasName": "LUSH GENTLE CLEAN",
          "mrp": "60",
          "discount": "33.33",
          "sellingPrice": "40",
          "wholeSalePrice": "32",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100621"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ ZERO FUMES TILES CLEANER",
          "aliasName": "ZYKZ ZERO FUMES TILES CLEANER",
          "mrp": "60",
          "discount": "50",
          "sellingPrice": "30",
          "wholeSalePrice": "23",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100623"
      },
      {
          "productType": "finished",
          "productName": "JKM SCALEOUT DRUM CLEANER",
          "aliasName": "JKM SCALEOUT DRUM CLEANER",
          "mrp": "190",
          "discount": "73.68",
          "sellingPrice": "50",
          "wholeSalePrice": "45",
          "hsnCode": "",
          "gst": "18",
          "barcode": "723172708108"
      },
      {
          "productType": "finished",
          "productName": "STYLX DTL BATH SOAP",
          "aliasName": "STYLX DTL",
          "mrp": "170",
          "discount": "23.53",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100626"
      },
      {
          "productType": "finished",
          "productName": "STYLX PINK BATH SOAP",
          "aliasName": "STYLX PINK",
          "mrp": "170",
          "discount": "23.53",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100624"
      },
      {
          "productType": "finished",
          "productName": "STYLX WHITE BATH SOAP",
          "aliasName": "STYLX WHITE",
          "mrp": "170",
          "discount": "23.53",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100625"
      },
      {
          "productType": "finished",
          "productName": "STYLX LIME BATH SOAP",
          "aliasName": "STYLX LIME",
          "mrp": "170",
          "discount": "23.53",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "100100100627"
      },
      {
          "productType": "estimated",
          "productName": "PLASTIC KHARATA BROOM",
          "aliasName": "PLASTIC HARD BROOM",
          "mrp": "172",
          "discount": "53.49",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280523"
      },
      {
          "productType": "estimated",
          "productName": "SK JUMBO DUST FREE BROOM",
          "aliasName": "GRASS BROOM",
          "mrp": "211",
          "discount": "52.61",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280524"
      },
      {
          "productType": "estimated",
          "productName": "DRAGON INCENSE STICKS",
          "aliasName": "DRAGON INCENSE STICKS",
          "mrp": "20",
          "discount": "50",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906134550621"
      },
      {
          "productType": "finished",
          "productName": "GLYCERINE SOAP BLUE ( 5 PCS )",
          "aliasName": "GLYCERINE SOAP BLUE",
          "mrp": "170",
          "discount": "41.18",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100630"
      },
      {
          "productType": "finished",
          "productName": "GLYCERINE SOAP ORANGE ( 5 PCS )",
          "aliasName": "GLYCERINE SOAP ORANGE",
          "mrp": "170",
          "discount": "41.18",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100629"
      },
      {
          "productType": "finished",
          "productName": "PIO JASMINE HAIR OIL 300ml",
          "aliasName": "JASMINE OIL",
          "mrp": "140",
          "discount": "28.57",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "33059019",
          "gst": "18",
          "barcode": "8906023892443"
      },
      {
          "productType": "finished",
          "productName": "HIM HERBAL AMLA HAIR OIL",
          "aliasName": "AMLA OIL",
          "mrp": "132",
          "discount": "24.24",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "30039011",
          "gst": "18",
          "barcode": "8906023891699"
      },
      {
          "productType": "finished",
          "productName": "HIM HERBAL OIL",
          "aliasName": "COOL OIL",
          "mrp": "145",
          "discount": "10.34",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "30039011",
          "gst": "12",
          "barcode": "8906023890364"
      },
      {
          "productType": "estimated",
          "productName": "SLM TOILET BRUSH",
          "aliasName": "SLM TOILET BRUSH",
          "mrp": "120",
          "discount": "25",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280525"
      },
      {
          "productType": "estimated",
          "productName": "WIPES",
          "aliasName": "WIPES",
          "mrp": "40",
          "discount": "25",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280526"
      },
      {
          "productType": "finished",
          "productName": "SIGN FRESHNERS GARDENIA 250 ml",
          "aliasName": "SIGN FRESHNERS GARDENIA 250 ml",
          "mrp": "210",
          "discount": "23.81",
          "sellingPrice": "160",
          "wholeSalePrice": "160",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904109905988"
      },
      {
          "productType": "finished",
          "productName": "SIGN FRESHNERS JASMINE 250 ml",
          "aliasName": "SIGN FRESHNERS JASMINE 250 ml",
          "mrp": "210",
          "discount": "23.81",
          "sellingPrice": "160",
          "wholeSalePrice": "160",
          "hsnCode": "96161010",
          "gst": "18",
          "barcode": "8904109905940"
      },
      {
          "productType": "finished",
          "productName": "SIGN FRESHNERS LEMON 250ml",
          "aliasName": "SIGN FRESHNERS LEMON 250ml",
          "mrp": "210",
          "discount": "23.81",
          "sellingPrice": "160",
          "wholeSalePrice": "160",
          "hsnCode": "96161010",
          "gst": "18",
          "barcode": "8904109905964"
      },
      {
          "productType": "finished",
          "productName": "SIGN FRESHNERS LAVENDER 250ml",
          "aliasName": "SIGN FRESHNERS LAVENDER 250ml",
          "mrp": "165",
          "discount": "3.03",
          "sellingPrice": "160",
          "wholeSalePrice": "160",
          "hsnCode": "96161010",
          "gst": "18",
          "barcode": "8904173505565"
      },
      {
          "productType": "finished",
          "productName": "SIGN FRESHNERS ORANGE 250ml",
          "aliasName": "SIGN FRESHNERS ORANGE 250ml",
          "mrp": "210",
          "discount": "23.81",
          "sellingPrice": "160",
          "wholeSalePrice": "160",
          "hsnCode": "96161010",
          "gst": "18",
          "barcode": "8904109906008"
      },
      {
          "productType": "finished",
          "productName": "SIGN FRESHNERS RAJNIGANDHA 250ml",
          "aliasName": "SIGN FRESHNERS RAJNIGANDHA 250ml",
          "mrp": "210",
          "discount": "23.81",
          "sellingPrice": "160",
          "wholeSalePrice": "160",
          "hsnCode": "96161010",
          "gst": "18",
          "barcode": "8904109905957"
      },
      {
          "productType": "finished",
          "productName": "SIGN FRESHNERS ROSE 250ml",
          "aliasName": "SIGN FRESHNERS ROSE 250ml",
          "mrp": "210",
          "discount": "23.81",
          "sellingPrice": "160",
          "wholeSalePrice": "160",
          "hsnCode": "96161010",
          "gst": "18",
          "barcode": "8904109905919"
      },
      {
          "productType": "finished",
          "productName": "SIGN FRESHNERS SANDAL 250ml",
          "aliasName": "SIGN FRESHNERS SANDAL 250ml",
          "mrp": "210",
          "discount": "23.81",
          "sellingPrice": "160",
          "wholeSalePrice": "160",
          "hsnCode": "96161010",
          "gst": "18",
          "barcode": "8904109905926"
      },
      {
          "productType": "finished",
          "productName": "SIGN FRESHNERS ROYAL FLORA 250ml",
          "aliasName": "SIGN FRESHNERS ROYAL FLORA 250ml",
          "mrp": "240",
          "discount": "20.83",
          "sellingPrice": "190",
          "wholeSalePrice": "190",
          "hsnCode": "96161010",
          "gst": "18",
          "barcode": "8904109906015"
      },
      {
          "productType": "finished",
          "productName": "SIGN DEO TALC BLACK JACK",
          "aliasName": "SIGN DEO TALC BLACK JACK",
          "mrp": "99",
          "discount": "39.39",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "96161010",
          "gst": "18",
          "barcode": "8904109910357"
      },
      {
          "productType": "estimated",
          "productName": "sunny 500 ml",
          "aliasName": "sunny 500 ml",
          "mrp": "120",
          "discount": "25",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8908002637076"
      },
      {
          "productType": "estimated",
          "productName": "PAVITRAM GOLD 200 g",
          "aliasName": "PAVITRAM GOLD 200 g",
          "mrp": "48",
          "discount": "47.92",
          "sellingPrice": "25",
          "wholeSalePrice": "25",
          "hsnCode": "",
          "gst": "18",
          "barcode": "723172707965"
      },
      {
          "productType": "estimated",
          "productName": "Garbage bag 25 X 30",
          "aliasName": "Garbage bag 25 X 30",
          "mrp": "105",
          "discount": "61.9",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280517"
      },
      {
          "productType": "finished",
          "productName": "GH AIR FRESHNER STRAWBERRY",
          "aliasName": "GH AIR FRESHNER STRAWBERRY",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074900",
          "gst": "18",
          "barcode": "8902618012999"
      },
      {
          "productType": "finished",
          "productName": "PITAMBARI POWDER 150 g",
          "aliasName": "PITAMBARI POWDER 150 g",
          "mrp": "45",
          "discount": "0",
          "sellingPrice": "45",
          "wholeSalePrice": "45",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8901468001610"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ ACTIVE GENTLE CLEAN",
          "aliasName": "ZYKZ ACTIVE GENTLE CLEAN",
          "mrp": "140",
          "discount": "50",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100628"
      },
      {
          "productType": "estimated",
          "productName": "MULTIPOD",
          "aliasName": "MULTIPOD",
          "mrp": "165",
          "discount": "45.45",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280527"
      },
      {
          "productType": "estimated",
          "productName": "DRAIN CLEANING PUMP",
          "aliasName": "DRAIN CLEANING PUMP",
          "mrp": "40",
          "discount": "25",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280528"
      },
      {
          "productType": "estimated",
          "productName": "REFILL",
          "aliasName": "REFILL",
          "mrp": "100",
          "discount": "50",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280518"
      },
      {
          "productType": "estimated",
          "productName": "COMFORT DOORMAT",
          "aliasName": "COMFORT DOORMAT",
          "mrp": "350",
          "discount": "60",
          "sellingPrice": "140",
          "wholeSalePrice": "140",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280532"
      },
      {
          "productType": "finished",
          "productName": "FRESHZONE NAPTHALENE BALLS 100 G",
          "aliasName": "FZ NAPTHALENE 100g",
          "mrp": "40",
          "discount": "25",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "29029",
          "gst": "18",
          "barcode": "816904280460"
      },
      {
          "productType": "finished",
          "productName": "FRESHZONE NAPTHALENE BALLS 250 G",
          "aliasName": "FZ NAPTHALENE 250g",
          "mrp": "100",
          "discount": "40",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "29029",
          "gst": "18",
          "barcode": "816904280461"
      },
      {
          "productType": "estimated",
          "productName": "GODREJ SPRAY",
          "aliasName": "GODREJ SPRAY",
          "mrp": "169",
          "discount": "23.08",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8901157045116"
      },
      {
          "productType": "estimated",
          "productName": "PIAZA DOORMAT",
          "aliasName": "PIAZA DOORMAT",
          "mrp": "380",
          "discount": "57.89",
          "sellingPrice": "160",
          "wholeSalePrice": "160",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280531"
      },
      {
          "productType": "estimated",
          "productName": "SIDE PARA DOORMAT",
          "aliasName": "SIDE PARA DOORMAT",
          "mrp": "400",
          "discount": "57.5",
          "sellingPrice": "170",
          "wholeSalePrice": "170",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280529"
      },
      {
          "productType": "estimated",
          "productName": "HOLO DOORMAT",
          "aliasName": "HOLO DOORMAT",
          "mrp": "420",
          "discount": "54.76",
          "sellingPrice": "190",
          "wholeSalePrice": "190",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280530"
      },
      {
          "productType": "finished",
          "productName": "SPUN FILTER REGULAR",
          "aliasName": "SPUN FILTER REGULAR",
          "mrp": "499",
          "discount": "87.98",
          "sellingPrice": "60",
          "wholeSalePrice": "41",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280468"
      },
      {
          "productType": "finished",
          "productName": "SPUN FILTER GOLD",
          "aliasName": "SPUN FILTER GOLD",
          "mrp": "450",
          "discount": "82.22",
          "sellingPrice": "80",
          "wholeSalePrice": "61",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280469"
      },
      {
          "productType": "estimated",
          "productName": "MICROFIBER",
          "aliasName": "MICROFIBER",
          "mrp": "123",
          "discount": "34.96",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280534"
      },
      {
          "productType": "finished",
          "productName": "SPUN FILTER 10\"\"",
          "aliasName": "SPUN FILTER 10\"\"",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "34",
          "hsnCode": "84212190",
          "gst": "18",
          "barcode": "816904280467"
      },
      {
          "productType": "estimated",
          "productName": "DORI 5M (16 FEET)",
          "aliasName": "192 INCH",
          "mrp": "30",
          "discount": "33.33",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280533"
      },
      {
          "productType": "estimated",
          "productName": "ALOVERA SOAP",
          "aliasName": "ALOVERA SOAP",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904304750529"
      },
      {
          "productType": "finished",
          "productName": "MEZZO BATH SOAP (1 PCS)",
          "aliasName": "MEZZO BATH SOAP (1 PCS)",
          "mrp": "32",
          "discount": "6.25",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "769807187573"
      },
      {
          "productType": "estimated",
          "productName": "CRESTA DOORMAT",
          "aliasName": "CRESTA DOORMAT",
          "mrp": "250",
          "discount": "48",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280542"
      },
      {
          "productType": "estimated",
          "productName": "GOL JALA",
          "aliasName": "GOL JALA",
          "mrp": "160",
          "discount": "37.5",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280539"
      },
      {
          "productType": "estimated",
          "productName": "DUST PAN",
          "aliasName": "DUST PAN",
          "mrp": "48",
          "discount": "37.5",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158100345"
      },
      {
          "productType": "estimated",
          "productName": "Filter key",
          "aliasName": "Filter key",
          "mrp": "60",
          "discount": "50",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280465"
      },
      {
          "productType": "estimated",
          "productName": "sunny 200 ml",
          "aliasName": "sunny 200 ml",
          "mrp": "50",
          "discount": "20",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280545"
      },
      {
          "productType": "estimated",
          "productName": "FRESHZONE",
          "aliasName": "FRESHZONE",
          "mrp": "45",
          "discount": "33.33",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "723172708054"
      },
      {
          "productType": "estimated",
          "productName": "Air Freshner",
          "aliasName": "Air Freshner",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "723172707989"
      },
      {
          "productType": "estimated",
          "productName": "KWICK DRAIN CLEANER",
          "aliasName": "KWICK DRAIN CLEANER",
          "mrp": "30",
          "discount": "33.33",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "723172708214"
      },
      {
          "productType": "estimated",
          "productName": "BOTTLE BRUSH",
          "aliasName": "BOTTLE BRUSH",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280535"
      },
      {
          "productType": "estimated",
          "productName": "TAR BRUSH",
          "aliasName": "TAR BRUSH",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280536"
      },
      {
          "productType": "estimated",
          "productName": "MICRO SMALL CLOTH",
          "aliasName": "MICRO SMALL CLOTH",
          "mrp": "40",
          "discount": "25",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280537"
      },
      {
          "productType": "estimated",
          "productName": "MOR JALA",
          "aliasName": "MOR JALA",
          "mrp": "180",
          "discount": "44.44",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280538"
      },
      {
          "productType": "finished",
          "productName": "DHOOP JIPPER",
          "aliasName": "DHOOP JIPPER",
          "mrp": "40",
          "discount": "37.5",
          "sellingPrice": "25",
          "wholeSalePrice": "25",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8929991611899"
      },
      {
          "productType": "finished",
          "productName": "JAI MALHAR CAMPHOR 20 G",
          "aliasName": "JAI MALHAR CAMPHOR 20 G",
          "mrp": "47",
          "discount": "36.17",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "29142922",
          "gst": "18",
          "barcode": "8929991611901"
      },
      {
          "productType": "finished",
          "productName": "BIG BOSS 30g",
          "aliasName": "BIG BOSS 30g",
          "mrp": "25",
          "discount": "20",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049570011"
      },
      {
          "productType": "finished",
          "productName": "EXCLUSIVE 35g",
          "aliasName": "EXCLUSIVE 35g",
          "mrp": "25",
          "discount": "20",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049570004"
      },
      {
          "productType": "finished",
          "productName": "ALL DAY 30g",
          "aliasName": "ALL DAY 30g",
          "mrp": "25",
          "discount": "20",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049570005"
      },
      {
          "productType": "finished",
          "productName": "POOJA PATH 60g",
          "aliasName": "POOJA PATH 60g",
          "mrp": "25",
          "discount": "20",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049570608"
      },
      {
          "productType": "finished",
          "productName": "GULAB 30g",
          "aliasName": "GULAB 30g",
          "mrp": "25",
          "discount": "20",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049571308"
      },
      {
          "productType": "finished",
          "productName": "BIG BOSS 3 IN 1 30g",
          "aliasName": "BIG BOSS 3 IN 1",
          "mrp": "25",
          "discount": "20",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049570012"
      },
      {
          "productType": "finished",
          "productName": "NAMASKAR 35g",
          "aliasName": "NAMASKAR 35g",
          "mrp": "25",
          "discount": "20",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049570013"
      },
      {
          "productType": "finished",
          "productName": "MAJA 25g",
          "aliasName": "MAJA 25g",
          "mrp": "30",
          "discount": "33.33",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8902240000067"
      },
      {
          "productType": "finished",
          "productName": "KASTURI 225g",
          "aliasName": "KASTURI 225g",
          "mrp": "175",
          "discount": "31.43",
          "sellingPrice": "120",
          "wholeSalePrice": "120",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049571612"
      },
      {
          "productType": "finished",
          "productName": "BIG BOSS 100g",
          "aliasName": "BIG BOSS 100g",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049571889"
      },
      {
          "productType": "finished",
          "productName": "ALL DAY 100g",
          "aliasName": "ALL DAY 100g",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049571613"
      },
      {
          "productType": "finished",
          "productName": "NAMASKAR 100g",
          "aliasName": "NAMASKAR 100g",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049573043"
      },
      {
          "productType": "finished",
          "productName": "BRAHMOTSAVAM 100g",
          "aliasName": "BRAHMOTSAVAM 100g",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8901734001139"
      },
      {
          "productType": "finished",
          "productName": "RAJNIGANDHA 100g",
          "aliasName": "RAJNIGANDHA 100g",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8901734017208"
      },
      {
          "productType": "finished",
          "productName": "PINEAPPLE 90g",
          "aliasName": "PINEAPPLE 90g",
          "mrp": "75",
          "discount": "33.33",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906067361738"
      },
      {
          "productType": "finished",
          "productName": "RUH FIRDOUS 90g",
          "aliasName": "RUH FIRDOUS 90g",
          "mrp": "75",
          "discount": "33.33",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906067361739"
      },
      {
          "productType": "finished",
          "productName": "HEENA OUD 90g",
          "aliasName": "HEENA OUD 90g",
          "mrp": "75",
          "discount": "33.33",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906067361740"
      },
      {
          "productType": "finished",
          "productName": "INTIMENT 90g",
          "aliasName": "INTIMENT 90g",
          "mrp": "75",
          "discount": "33.33",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906067361741"
      },
      {
          "productType": "finished",
          "productName": "KESHAR KEWDA 90g",
          "aliasName": "KESHAR KEWDA 90g",
          "mrp": "75",
          "discount": "33.33",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906067361742"
      },
      {
          "productType": "finished",
          "productName": "GANGAJAL 100g",
          "aliasName": "GANGAJAL 100g",
          "mrp": "75",
          "discount": "33.33",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906067361743"
      },
      {
          "productType": "finished",
          "productName": "JASS 100g",
          "aliasName": "JASS 100g",
          "mrp": "100",
          "discount": "30",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "133074100",
          "gst": "5",
          "barcode": "8929991611960"
      },
      {
          "productType": "finished",
          "productName": "ONE 100g",
          "aliasName": "ONE 100g",
          "mrp": "100",
          "discount": "30",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8929991611961"
      },
      {
          "productType": "finished",
          "productName": "BLUE 100g",
          "aliasName": "BLUE 100g",
          "mrp": "100",
          "discount": "30",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8929991611892"
      },
      {
          "productType": "finished",
          "productName": "RADO 100g",
          "aliasName": "RADO 100g",
          "mrp": "100",
          "discount": "30",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8929991612028"
      },
      {
          "productType": "finished",
          "productName": "BHARAT VASI 200g",
          "aliasName": "BHARAT VASI 200g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8929991611893"
      },
      {
          "productType": "finished",
          "productName": "FANTASIA 200g",
          "aliasName": "FANTASIA 200g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8929991611894"
      },
      {
          "productType": "finished",
          "productName": "FIRDOUS 200g",
          "aliasName": "FIRDOUS 200g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8929991611895"
      },
      {
          "productType": "finished",
          "productName": "SON CHAFA 200g",
          "aliasName": "SON CHAFA 200g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8929991611896"
      },
      {
          "productType": "finished",
          "productName": "MYSORE SUGANDH 225g",
          "aliasName": "MYSORE SUGANDH 225g",
          "mrp": "150",
          "discount": "33.33",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8929991611897"
      },
      {
          "productType": "finished",
          "productName": "HIMALAYA LOBAN 225g",
          "aliasName": "HIMALAYA LOBAN 225g",
          "mrp": "150",
          "discount": "33.33",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8929991611898"
      },
      {
          "productType": "finished",
          "productName": "JAI GANESH 225g",
          "aliasName": "JAI GANESH 225g",
          "mrp": "150",
          "discount": "33.33",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906038340045"
      },
      {
          "productType": "finished",
          "productName": "WHITE SANDAL 250g",
          "aliasName": "WHITE SANDAL 250g",
          "mrp": "180",
          "discount": "33.33",
          "sellingPrice": "120",
          "wholeSalePrice": "120",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906038341820"
      },
      {
          "productType": "finished",
          "productName": "ASHOKA 250g",
          "aliasName": "ASHOKA 250g",
          "mrp": "180",
          "discount": "33.33",
          "sellingPrice": "120",
          "wholeSalePrice": "120",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906038341844"
      },
      {
          "productType": "finished",
          "productName": "SRIFAL SANDAL DHOOP 100g",
          "aliasName": "SRIFAL SANDAL DHOOP",
          "mrp": "75",
          "discount": "20",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906125920747"
      },
      {
          "productType": "finished",
          "productName": "MADHURA DHOOP",
          "aliasName": "MADHURA DHOOP",
          "mrp": "45",
          "discount": "11.11",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906067361745"
      },
      {
          "productType": "finished",
          "productName": "LOBAN DRY STICK",
          "aliasName": "LOBAN DRY STICK",
          "mrp": "15",
          "discount": "33.33",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049573357"
      },
      {
          "productType": "finished",
          "productName": "DENIM GOLD DHOOP",
          "aliasName": "DENIM GOLD DHOOP",
          "mrp": "65",
          "discount": "7.69",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049571964"
      },
      {
          "productType": "finished",
          "productName": "DRY STICK",
          "aliasName": "DRY STICK",
          "mrp": "15",
          "discount": "33.33",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049573913"
      },
      {
          "productType": "finished",
          "productName": "JAI MALHAR CAMPHOR 40g",
          "aliasName": "JAI MALHAR CAMPHOR 40g",
          "mrp": "90",
          "discount": "44.44",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "29142922",
          "gst": "18",
          "barcode": "8929991611900"
      },
      {
          "productType": "finished",
          "productName": "SADGURU CAMPHOR 15g",
          "aliasName": "SADGURU CAMPHOR 15g",
          "mrp": "50",
          "discount": "20",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "29142922",
          "gst": "18",
          "barcode": "8929991611902"
      },
      {
          "productType": "finished",
          "productName": "JAI MALHAR 10g DABBI",
          "aliasName": "JAI MALHAR 10g DABBI",
          "mrp": "36",
          "discount": "44.44",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "29142922",
          "gst": "18",
          "barcode": "8929991611903"
      },
      {
          "productType": "finished",
          "productName": "MOGRA ZIPPER 130g",
          "aliasName": "MOGRA ZIPPER 130g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8929991611904"
      },
      {
          "productType": "estimated",
          "productName": "SAMARTHYA BUCKET SPIN MOP (STEEL)",
          "aliasName": "BUCKET MOP (STEEL)",
          "mrp": "1299",
          "discount": "38.41",
          "sellingPrice": "800",
          "wholeSalePrice": "800",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280540"
      },
      {
          "productType": "estimated",
          "productName": "SS JALA",
          "aliasName": "SS JALA",
          "mrp": "330",
          "discount": "45.45",
          "sellingPrice": "180",
          "wholeSalePrice": "180",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158100543"
      },
      {
          "productType": "estimated",
          "productName": "PREMIUM BOTTLE BRUSH",
          "aliasName": "PREMIUM BOTTLE BRUSH",
          "mrp": "90",
          "discount": "44.44",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "6957115560124"
      },
      {
          "productType": "finished",
          "productName": "WRENCH 2 SIDE",
          "aliasName": "WRENCH 2 SIDE",
          "mrp": "60",
          "discount": "50",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280544"
      },
      {
          "productType": "estimated",
          "productName": "FRESHZONE NAPTHALENE BALLS 500g",
          "aliasName": "FRESHZONE NAPTHALENE BALLS 500g",
          "mrp": "190",
          "discount": "42.11",
          "sellingPrice": "110",
          "wholeSalePrice": "110",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280456"
      },
      {
          "productType": "estimated",
          "productName": "KHARATA JHADU BIG",
          "aliasName": "KHARATA JHADU BIG",
          "mrp": "60",
          "discount": "33.33",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "0",
          "barcode": "816904280457"
      },
      {
          "productType": "estimated",
          "productName": "JATAKANI",
          "aliasName": "JATAKANI",
          "mrp": "72",
          "discount": "30.56",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "0",
          "barcode": "8906158100550"
      },
      {
          "productType": "finished",
          "productName": "CONE DHOOP",
          "aliasName": "CONE DHOOP",
          "mrp": "15",
          "discount": "33.33",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906049571698"
      },
      {
          "productType": "finished",
          "productName": "PREMIUM BHIMSENI KAPOOR 50g",
          "aliasName": "BHIMSENI KAPOOR 50g",
          "mrp": "150",
          "discount": "46.67",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280458"
      },
      {
          "productType": "estimated",
          "productName": "FLOOR CLEANING BRUSH",
          "aliasName": "FLOOR CLEANING BRUSH",
          "mrp": "550",
          "discount": "40",
          "sellingPrice": "330",
          "wholeSalePrice": "330",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280464"
      },
      {
          "productType": "estimated",
          "productName": "SUPER BROOM",
          "aliasName": "SUPER BROOM",
          "mrp": "211",
          "discount": "62.09",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "0",
          "barcode": "816904280459"
      },
      {
          "productType": "finished",
          "productName": "GOOD EVENING AGARBATTI",
          "aliasName": "GOOD EVENING AGARBATTI",
          "mrp": "15",
          "discount": "33.33",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906084900408"
      },
      {
          "productType": "finished",
          "productName": "JELLY WHITE",
          "aliasName": "JELLY WHITE",
          "mrp": "100",
          "discount": "15",
          "sellingPrice": "85",
          "wholeSalePrice": "85",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280466"
      },
      {
          "productType": "estimated",
          "productName": "SI BEAUTY CARE SOAP",
          "aliasName": "SI BEAUTY CARE SOAP",
          "mrp": "190",
          "discount": "21.05",
          "sellingPrice": "150",
          "wholeSalePrice": "150",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280470"
      },
      {
          "productType": "estimated",
          "productName": "PEPSI CUBES",
          "aliasName": "PEPSI CUBES",
          "mrp": "65",
          "discount": "53.85",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280471"
      },
      {
          "productType": "estimated",
          "productName": "GLOBAL PLAST HANGER",
          "aliasName": "GLOBAL PLAST HANGER",
          "mrp": "180",
          "discount": "27.78",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280472"
      },
      {
          "productType": "estimated",
          "productName": "LOOFAH",
          "aliasName": "LOOFAH",
          "mrp": "49",
          "discount": "48.98",
          "sellingPrice": "25",
          "wholeSalePrice": "25",
          "hsnCode": "",
          "gst": "0",
          "barcode": "816904280473"
      },
      {
          "productType": "estimated",
          "productName": "TILES HANDLE SCRUBBER",
          "aliasName": "TILES HANDLE SCRUBBER",
          "mrp": "99",
          "discount": "39.39",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "",
          "gst": "0",
          "barcode": "816904280474"
      },
      {
          "productType": "estimated",
          "productName": "TAP FILTER",
          "aliasName": "TAP FILTER",
          "mrp": "25",
          "discount": "60",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "",
          "gst": "0",
          "barcode": "816904280475"
      },
      {
          "productType": "estimated",
          "productName": "MOR JALA PREMIUM",
          "aliasName": "MOR JALA PREMIUM",
          "mrp": "259",
          "discount": "49.81",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "",
          "gst": "0",
          "barcode": "816904280476"
      },
      {
          "productType": "finished",
          "productName": "KACHUA CHHAP",
          "aliasName": "KACHUA CHHAP",
          "mrp": "15",
          "discount": "33.33",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906008580136"
      },
      {
          "productType": "finished",
          "productName": "HAPPY NIGHT HERBAL STICKS",
          "aliasName": "HAPPY NIGHT",
          "mrp": "15",
          "discount": "33.33",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280477"
      },
      {
          "productType": "finished",
          "productName": "INTIMATE 200GM",
          "aliasName": "INTIMATE 200GM",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280478"
      },
      {
          "productType": "finished",
          "productName": "PEPSI CUBES BIG",
          "aliasName": "PEPSI CUBES BIG",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904053003785"
      },
      {
          "productType": "finished",
          "productName": "KAPOOR DANI",
          "aliasName": "KAPOOR DANI",
          "mrp": "250",
          "discount": "52",
          "sellingPrice": "120",
          "wholeSalePrice": "120",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280479"
      },
      {
          "productType": "finished",
          "productName": "KAPOOR DANI BIG",
          "aliasName": "KAPOOR DANI BIG",
          "mrp": "599",
          "discount": "51.59",
          "sellingPrice": "290",
          "wholeSalePrice": "290",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280480"
      },
      {
          "productType": "estimated",
          "productName": "METALLIC SRUB PAD",
          "aliasName": "METALLIC SRUB PAD",
          "mrp": "35",
          "discount": "28.57",
          "sellingPrice": "25",
          "wholeSalePrice": "25",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904238000615"
      },
      {
          "productType": "estimated",
          "productName": "SI SOAP",
          "aliasName": "SI SOAP",
          "mrp": "180",
          "discount": "22.22",
          "sellingPrice": "140",
          "wholeSalePrice": "140",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280546"
      },
      {
          "productType": "estimated",
          "productName": "BOTTLE 500ml",
          "aliasName": "BOTTLE 500ml",
          "mrp": "65",
          "discount": "53.85",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8160943560"
      },
      {
          "productType": "estimated",
          "productName": "BOTTLE 1000ml",
          "aliasName": "BOTTLE 1000ml",
          "mrp": "101",
          "discount": "60.4",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8160943559"
      },
      {
          "productType": "estimated",
          "productName": "BATHROOM WIPER",
          "aliasName": "BATHROOM WIPER",
          "mrp": "165",
          "discount": "39.39",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "9898618980186"
      },
      {
          "productType": "finished",
          "productName": "SANICUBE (1Pcs)",
          "aliasName": "SANICUBE",
          "mrp": "30",
          "discount": "33.33",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "89040842007578"
      },
      {
          "productType": "estimated",
          "productName": "DETERGENT SOAP CASE",
          "aliasName": "DETERGENT SOAP CASE",
          "mrp": "30",
          "discount": "33.33",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280548"
      },
      {
          "productType": "estimated",
          "productName": "SQUARE LIQUID DISPENSER",
          "aliasName": "SQUARE LIQUID DISPENSER",
          "mrp": "140",
          "discount": "42.86",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280549"
      },
      {
          "productType": "estimated",
          "productName": "MICROFIBER ROD MOP",
          "aliasName": "MICROFIBER ROD MOP",
          "mrp": "300",
          "discount": "43.33",
          "sellingPrice": "170",
          "wholeSalePrice": "170",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280550"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ PLUS MULTI SURFACE CLEANER MOGRA 5 Ltr",
          "aliasName": "ZYKZ PLUS MULTI SURFACE CLEANER MOGRA 5 Ltr",
          "mrp": "350",
          "discount": "42.86",
          "sellingPrice": "200",
          "wholeSalePrice": "200",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100636"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ PLUS MULTI SURFACE CLEANER LEMON 5 Ltr",
          "aliasName": "ZYKZ PLUS MULTI SURFACE CLEANER LEMON 5 Ltr",
          "mrp": "350",
          "discount": "42.86",
          "sellingPrice": "200",
          "wholeSalePrice": "200",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100635"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ PLUS MULTI SURFACE CLEANER ROSE 5 Ltr",
          "aliasName": "ZYKZ PLUS MULTI SURFACE CLEANER ROSE 5 Ltr",
          "mrp": "350",
          "discount": "42.86",
          "sellingPrice": "200",
          "wholeSalePrice": "200",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100637"
      },
      {
          "productType": "estimated",
          "productName": "DORI 10M (32 FEET)",
          "aliasName": "DORI 10M (32 FEET) 384 I",
          "mrp": "60",
          "discount": "50",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280551"
      },
      {
          "productType": "estimated",
          "productName": "MOR SS JALA",
          "aliasName": "MOR SS JALA",
          "mrp": "315",
          "discount": "46.03",
          "sellingPrice": "170",
          "wholeSalePrice": "170",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158100437"
      },
      {
          "productType": "finished",
          "productName": "DND Secure Roach Shield Cockroach Gel",
          "aliasName": "DND Secure Roach Shield Cockroach Gel",
          "mrp": "425",
          "discount": "45.88",
          "sellingPrice": "230",
          "wholeSalePrice": "230",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906079015797"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ THICK WHITE PHENYL 1 LTR",
          "aliasName": "ZYKZ THICK WHITE PHENYL 1 LTR",
          "mrp": "80",
          "discount": "50",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "100100100638"
      },
      {
          "productType": "estimated",
          "productName": "LIQUID SOAP DISPENSER WITH PUMP",
          "aliasName": "SOAP DISPENSER",
          "mrp": "179",
          "discount": "44.13",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280552"
      },
      {
          "productType": "estimated",
          "productName": "PUSH LIQUID SOAP DISPENSER",
          "aliasName": "PUSH LIQUID SOAP DISPENSER",
          "mrp": "199",
          "discount": "39.7",
          "sellingPrice": "120",
          "wholeSalePrice": "120",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280553"
      },
      {
          "productType": "estimated",
          "productName": "TWIST MOP SS",
          "aliasName": "",
          "mrp": "390",
          "discount": "48.72",
          "sellingPrice": "200",
          "wholeSalePrice": "200",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280554"
      },
      {
          "productType": "estimated",
          "productName": "TWIST MOP",
          "aliasName": "TWIST MOP",
          "mrp": "299",
          "discount": "43.14",
          "sellingPrice": "170",
          "wholeSalePrice": "170",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280555"
      },
      {
          "productType": "estimated",
          "productName": "INSULATED BOTTLE",
          "aliasName": "INSULATED BOTTLE",
          "mrp": "120",
          "discount": "33.33",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280556"
      },
      {
          "productType": "estimated",
          "productName": "FLAT MOP",
          "aliasName": "FLAT MOP",
          "mrp": "699",
          "discount": "49.93",
          "sellingPrice": "350",
          "wholeSalePrice": "350",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280557"
      },
      {
          "productType": "estimated",
          "productName": "PLUNGER",
          "aliasName": "PLUNGER",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280558"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ GENTLE WASH LIME FRESH",
          "aliasName": "ZYKZ GENTLE WASH LIME FRESH",
          "mrp": "120",
          "discount": "41.67",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100639"
      },
      {
          "productType": "finished",
          "productName": "HIT COCROACHES GEL",
          "aliasName": "HIT COCROACHES GEL",
          "mrp": "199",
          "discount": "0",
          "sellingPrice": "199",
          "wholeSalePrice": "199",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8901023010002"
      },
      {
          "productType": "finished",
          "productName": "WHITE KAPOOR INCENSE STICK",
          "aliasName": "WHITE KAPOOR INCENSE STICK",
          "mrp": "70",
          "discount": "7.14",
          "sellingPrice": "65",
          "wholeSalePrice": "65",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906118120338"
      },
      {
          "productType": "estimated",
          "productName": "TOWEL",
          "aliasName": "TOWEL",
          "mrp": "40",
          "discount": "50",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280559"
      },
      {
          "productType": "finished",
          "productName": "BAMBOOLESS DRY STICK",
          "aliasName": "BAMBOOLESS DRY STICK",
          "mrp": "65",
          "discount": "23.08",
          "sellingPrice": "50",
          "wholeSalePrice": "0",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906049573715"
      },
      {
          "productType": "finished",
          "productName": "COMFORT AGARBATTI",
          "aliasName": "COMFORT AGARBATTI",
          "mrp": "15",
          "discount": "33.33",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280561"
      },
      {
          "productType": "finished",
          "productName": "GOLA DHOOP",
          "aliasName": "GOLA DHOOP",
          "mrp": "75",
          "discount": "33.33",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906049574422"
      },
      {
          "productType": "finished",
          "productName": "CAMPHOR CONE",
          "aliasName": "CAMPHOR CONE",
          "mrp": "199",
          "discount": "34.67",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280560"
      },
      {
          "productType": "estimated",
          "productName": "ROUND TOILET BRUSH",
          "aliasName": "ROUND TOILET BRUSH",
          "mrp": "206",
          "discount": "61.17",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8908023431035"
      },
      {
          "productType": "finished",
          "productName": "HIM HERBAL SUKOON OIL",
          "aliasName": "HIM HERBAL SUKOON OIL",
          "mrp": "125",
          "discount": "28",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "",
          "gst": "12",
          "barcode": "8906023891651"
      },
      {
          "productType": "finished",
          "productName": "DV WHITE STYLX",
          "aliasName": "DV WHITE STYLX",
          "mrp": "180",
          "discount": "22.22",
          "sellingPrice": "140",
          "wholeSalePrice": "140",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280563"
      },
      {
          "productType": "estimated",
          "productName": "TOOTHBRUSH",
          "aliasName": "TOOTHBRUSH",
          "mrp": "25",
          "discount": "20",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280564"
      },
      {
          "productType": "estimated",
          "productName": "LOOFAH WITH HANDLE",
          "aliasName": "LOOFAH WITH HANDLE",
          "mrp": "90",
          "discount": "55.56",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280565"
      },
      {
          "productType": "estimated",
          "productName": "HOOK",
          "aliasName": "HOOK",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "6942135132505"
      },
      {
          "productType": "estimated",
          "productName": "SPONGE SCRUBBER",
          "aliasName": "SPONGE SCRUBBER",
          "mrp": "20",
          "discount": "25",
          "sellingPrice": "15",
          "wholeSalePrice": "15",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904238000943"
      },
      {
          "productType": "estimated",
          "productName": "TAR",
          "aliasName": "TAR",
          "mrp": "22",
          "discount": "54.55",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280568"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ VITAL GENTLE CLEAN 1 LTR",
          "aliasName": "ZYKZ VITAL GENTLE CLEAN 1 LTR",
          "mrp": "170",
          "discount": "50",
          "sellingPrice": "85",
          "wholeSalePrice": "85",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100640"
      },
      {
          "productType": "finished",
          "productName": "TOTAL CARE HI CLEAN LOW FOAMING DET LIQ 1 LTR",
          "aliasName": "TOTAL CARE HI CLEAN LOW FOAMING DET LIQ 1 LTR",
          "mrp": "160",
          "discount": "50",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100642"
      },
      {
          "productType": "estimated",
          "productName": "SOAP DISH",
          "aliasName": "SOAP DISH",
          "mrp": "40",
          "discount": "50",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158100766"
      },
      {
          "productType": "estimated",
          "productName": "ARISTO BUCKET 15 LTR",
          "aliasName": "ARISTO BUCKET 15 LTR",
          "mrp": "266",
          "discount": "36.09",
          "sellingPrice": "170",
          "wholeSalePrice": "170",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280570"
      },
      {
          "productType": "estimated",
          "productName": "ARISTO BUCKET 18 LTR",
          "aliasName": "ARISTO BUCKET 18 LTR",
          "mrp": "304",
          "discount": "37.5",
          "sellingPrice": "190",
          "wholeSalePrice": "190",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280571"
      },
      {
          "productType": "estimated",
          "productName": "ROUND TOILET BRUSH WITH STAND",
          "aliasName": "ROUND TOILET BRUSH WITH STAND",
          "mrp": "260",
          "discount": "57.69",
          "sellingPrice": "110",
          "wholeSalePrice": "110",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8908023431042"
      },
      {
          "productType": "finished",
          "productName": "DYNA BUCKET 15Ltr",
          "aliasName": "DYNA BUCKET 15Ltr",
          "mrp": "266",
          "discount": "36.09",
          "sellingPrice": "170",
          "wholeSalePrice": "170",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904114503339"
      },
      {
          "productType": "finished",
          "productName": "DYNA BUCKET 18Ltr",
          "aliasName": "DYNA BUCKET 18Ltr",
          "mrp": "304",
          "discount": "37.5",
          "sellingPrice": "190",
          "wholeSalePrice": "190",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904114503353"
      },
      {
          "productType": "estimated",
          "productName": "MUG",
          "aliasName": "MUG",
          "mrp": "50",
          "discount": "60",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158100641"
      },
      {
          "productType": "estimated",
          "productName": "PREMIUM SINK BRUSH",
          "aliasName": "PREMIUM SINK BRUSH",
          "mrp": "69",
          "discount": "27.54",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158100642"
      },
      {
          "productType": "estimated",
          "productName": "PIGEON CLOTH CLIP",
          "aliasName": "PIGEON CLOTH CLIP",
          "mrp": "120",
          "discount": "50",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158100659"
      },
      {
          "productType": "finished",
          "productName": "KESHGANGE 200ml",
          "aliasName": "KESHGANGE 200ml",
          "mrp": "150",
          "discount": "13.33",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "",
          "gst": "12",
          "barcode": "8906023890999"
      },
      {
          "productType": "estimated",
          "productName": "LAXMI GRASS BROOM BLUE",
          "aliasName": "LAXMI GRASS BROOM BLUE",
          "mrp": "180",
          "discount": "50",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280572"
      },
      {
          "productType": "estimated",
          "productName": "KHARATA JUMBO",
          "aliasName": "KHARATA JUMBO",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280573"
      },
      {
          "productType": "estimated",
          "productName": "GRASS DOORMAT",
          "aliasName": "GRASS DOORMAT",
          "mrp": "280",
          "discount": "46.43",
          "sellingPrice": "150",
          "wholeSalePrice": "150",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280574"
      },
      {
          "productType": "finished",
          "productName": "KILL COCROACH GEL",
          "aliasName": "KILL COCROACH GEL",
          "mrp": "60",
          "discount": "0",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8908019376173"
      },
      {
          "productType": "finished",
          "productName": "SIGNATURE AIR F MORNING",
          "aliasName": "SIGNATURE AIR F MORNING",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904109910449"
      },
      {
          "productType": "finished",
          "productName": "SIGNATURE AIR F FRENCH",
          "aliasName": "SIGNATURE AIR F FRENCH",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904109910456"
      },
      {
          "productType": "finished",
          "productName": "SIGNATURE AIR F CITRUS",
          "aliasName": "SIGNATURE AIR F CITRUS",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904109910432"
      },
      {
          "productType": "finished",
          "productName": "SIGNATURE AIR F PASSION BLAST",
          "aliasName": "SIGNATURE AIR F PASSION BLAST",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904109910463"
      },
      {
          "productType": "estimated",
          "productName": "BUDS",
          "aliasName": "BUDS",
          "mrp": "40",
          "discount": "50",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280566"
      },
      {
          "productType": "estimated",
          "productName": "CLOTH BRUSH JUMBO",
          "aliasName": "CLOTH BRUSH JUMBO",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280567"
      },
      {
          "productType": "estimated",
          "productName": "METALLIC JALI",
          "aliasName": "METALLIC JALI",
          "mrp": "40",
          "discount": "50",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280569"
      },
      {
          "productType": "estimated",
          "productName": "GREEN SCRUB PAD",
          "aliasName": "GREEN SCRUB PAD",
          "mrp": "18",
          "discount": "44.44",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158100680"
      },
      {
          "productType": "estimated",
          "productName": "DISH CLOTH CLEANING PAD",
          "aliasName": "DISH CLOTH CLEANING PAD",
          "mrp": "40",
          "discount": "25",
          "sellingPrice": "30",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8908002468274"
      },
      {
          "productType": "estimated",
          "productName": "EMPTY DRUM 50 KGS",
          "aliasName": "EMPTY DRUM 50 KGS",
          "mrp": "500",
          "discount": "30",
          "sellingPrice": "350",
          "wholeSalePrice": "350",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280575"
      },
      {
          "productType": "finished",
          "productName": "ARBUDA CHALK",
          "aliasName": "ARBUDA CHALK",
          "mrp": "18",
          "discount": "16.67",
          "sellingPrice": "15",
          "wholeSalePrice": "15",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904427900153"
      },
      {
          "productType": "estimated",
          "productName": "PLASTIC KHARATA SMALL",
          "aliasName": "PLASTIC KHARATA SMALL",
          "mrp": "150",
          "discount": "53.33",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280576"
      },
      {
          "productType": "finished",
          "productName": "TEZ JAR DRY STICK",
          "aliasName": "TEZ JAR STICK",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280577"
      },
      {
          "productType": "finished",
          "productName": "SADGURU MOGRA 200g",
          "aliasName": "SADGURU MOGRA 200g",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280578"
      },
      {
          "productType": "finished",
          "productName": "SADGURU GULAB 200g",
          "aliasName": "SADGURU GULAB 200g",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280579"
      },
      {
          "productType": "finished",
          "productName": "SADGURU SANDAL 200g",
          "aliasName": "SADGURU SANDAL 200g",
          "mrp": "95",
          "discount": "47.37",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280580"
      },
      {
          "productType": "finished",
          "productName": "KASHMIRI LOBAN 250g",
          "aliasName": "KASHMIRI LOBAN 250g",
          "mrp": "160",
          "discount": "37.5",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280581"
      },
      {
          "productType": "finished",
          "productName": "WHITE LOBAN 250g",
          "aliasName": "WHITE LOBAN 250g",
          "mrp": "160",
          "discount": "37.5",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280582"
      },
      {
          "productType": "finished",
          "productName": "POLO 250g",
          "aliasName": "POLO 250g",
          "mrp": "160",
          "discount": "37.5",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280583"
      },
      {
          "productType": "finished",
          "productName": "SHINE 250g",
          "aliasName": "SHINE 250g",
          "mrp": "160",
          "discount": "37.5",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280584"
      },
      {
          "productType": "finished",
          "productName": "SKY 250g",
          "aliasName": "SKY 250g",
          "mrp": "140",
          "discount": "28.57",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280585"
      },
      {
          "productType": "finished",
          "productName": "PAVITRA BELLA 250g",
          "aliasName": "PAVITRA BELLA 250g",
          "mrp": "160",
          "discount": "37.5",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280586"
      },
      {
          "productType": "estimated",
          "productName": "NYLON SPONGE SCRUBBER",
          "aliasName": "NYLON SPONGE SCRUBBER",
          "mrp": "33",
          "discount": "39.39",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158100673"
      },
      {
          "productType": "estimated",
          "productName": "WIPER 21\"\"",
          "aliasName": "WIPER 21\"\"",
          "mrp": "180",
          "discount": "44.44",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280587"
      },
      {
          "productType": "estimated",
          "productName": "DOORMAT",
          "aliasName": "DOORMAT",
          "mrp": "150",
          "discount": "33.33",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280588"
      },
      {
          "productType": "finished",
          "productName": "GODREJ",
          "aliasName": "GODREJ",
          "mrp": "99",
          "discount": "0",
          "sellingPrice": "99",
          "wholeSalePrice": "99",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280589"
      },
      {
          "productType": "estimated",
          "productName": "LAUNDRY BALLS",
          "aliasName": "LAUNDRY BALLS",
          "mrp": "99",
          "discount": "49.49",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280590"
      },
      {
          "productType": "estimated",
          "productName": "CRYSTAL TOOTHBRUSH",
          "aliasName": "CRYSTAL TOOTHBRUSH",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280591"
      },
      {
          "productType": "finished",
          "productName": "SADGURU SARPANCH 200g",
          "aliasName": "SADGURU SARPANCH 200g",
          "mrp": "100",
          "discount": "20",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280592"
      },
      {
          "productType": "finished",
          "productName": "SADGURU BHARAT MATA 200g",
          "aliasName": "SADGURU BHARAT MATA 200g",
          "mrp": "100",
          "discount": "20",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280593"
      },
      {
          "productType": "finished",
          "productName": "SAMBRANI CUP",
          "aliasName": "SAMBRANI CUP",
          "mrp": "90",
          "discount": "33.33",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "816904280594"
      },
      {
          "productType": "finished",
          "productName": "LAVENDER 225g",
          "aliasName": "LAVENDER 225g",
          "mrp": "125",
          "discount": "20",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906071813810"
      },
      {
          "productType": "finished",
          "productName": "TEZ PRATHNA 250g",
          "aliasName": "TEZ PRATHNA 250g",
          "mrp": "100",
          "discount": "20",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8907477003171"
      },
      {
          "productType": "finished",
          "productName": "ANNAMAYA (7 in 1)",
          "aliasName": "ANNAMAYA (7 in 1)",
          "mrp": "110",
          "discount": "9.09",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8901734001450"
      },
      {
          "productType": "finished",
          "productName": "WHITE LOBAN JIPPER",
          "aliasName": "WHITE LOBAN JIPPER",
          "mrp": "130",
          "discount": "61.54",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8907477006301"
      },
      {
          "productType": "finished",
          "productName": "VEEANA AGARBATTI 225g",
          "aliasName": "VEEANA AGARBATTI 225g",
          "mrp": "125",
          "discount": "36",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280595"
      },
      {
          "productType": "estimated",
          "productName": "URINAL PAD",
          "aliasName": "URINAL PAD",
          "mrp": "80",
          "discount": "50",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280596"
      },
      {
          "productType": "estimated",
          "productName": "RAJ CLEANWELL SCRUBBER",
          "aliasName": "RAJ CLEANWELL SCRUBBER",
          "mrp": "21",
          "discount": "4.76",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280597"
      },
      {
          "productType": "estimated",
          "productName": "METAL DORI 10M",
          "aliasName": "METAL DORI 10M",
          "mrp": "100",
          "discount": "40",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "",
          "gst": "18",
          "barcode": "3320825222102"
      },
      {
          "productType": "finished",
          "productName": "MT GARBAGE BAGS 19/21",
          "aliasName": "MT GARBAGE BAGS 19/21",
          "mrp": "125",
          "discount": "76",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "3923",
          "gst": "18",
          "barcode": "816904280644"
      },
      {
          "productType": "finished",
          "productName": "MT SMT WIPER 16.5\"\"",
          "aliasName": "MT SMT WIPER 16.5\"\"",
          "mrp": "150",
          "discount": "53.33",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280645"
      },
      {
          "productType": "finished",
          "productName": "MT HANSORA BRUSH SMALL",
          "aliasName": "MT HANSORA BRUSH SMALL",
          "mrp": "80",
          "discount": "62.5",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "4417",
          "gst": "12",
          "barcode": "816904280646"
      },
      {
          "productType": "finished",
          "productName": "MT CLOTH BRUSH BIG",
          "aliasName": "MT CLOTH BRUSH BIG",
          "mrp": "100",
          "discount": "60",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280647"
      },
      {
          "productType": "finished",
          "productName": "MT TOILET BRUSH BOTH SIDE",
          "aliasName": "MT TOILET BRUSH BOTH SIDE",
          "mrp": "90",
          "discount": "44.44",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280648"
      },
      {
          "productType": "finished",
          "productName": "MT MICRO SMALL CLOTH",
          "aliasName": "MT MICRO SMALL CLOTH",
          "mrp": "60",
          "discount": "50",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "6307",
          "gst": "12",
          "barcode": "816904280649"
      },
      {
          "productType": "finished",
          "productName": "MT LONDON MOP",
          "aliasName": "MT LONDON MOP",
          "mrp": "150",
          "discount": "46.67",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280650"
      },
      {
          "productType": "finished",
          "productName": "MT RODSET",
          "aliasName": "MT RODSET",
          "mrp": "399",
          "discount": "27.32",
          "sellingPrice": "290",
          "wholeSalePrice": "290",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280651"
      },
      {
          "productType": "finished",
          "productName": "MT AIRPACKFRESHNER",
          "aliasName": "MT AIRPACKFRESHNER",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280652"
      },
      {
          "productType": "finished",
          "productName": "MT KWICK POWDER",
          "aliasName": "MT KWICK POWDER",
          "mrp": "30",
          "discount": "33.33",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "816904280653"
      },
      {
          "productType": "finished",
          "productName": "MT FRESHZONE DEODORIZER",
          "aliasName": "MT FRESHZONE DEODORIZER",
          "mrp": "45",
          "discount": "33.33",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "3307",
          "gst": "18",
          "barcode": "816904280654"
      },
      {
          "productType": "finished",
          "productName": "MT DUSTPAN",
          "aliasName": "MT DUSTPAN",
          "mrp": "48",
          "discount": "37.5",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "3924",
          "gst": "18",
          "barcode": "816904280655"
      },
      {
          "productType": "finished",
          "productName": "MT DUSTER 22X22",
          "aliasName": "MT DUSTER 22X22",
          "mrp": "60",
          "discount": "58.33",
          "sellingPrice": "25",
          "wholeSalePrice": "25",
          "hsnCode": "6307",
          "gst": "5",
          "barcode": "816904280656"
      },
      {
          "productType": "finished",
          "productName": "MT DOORMAT",
          "aliasName": "MT DOORMAT",
          "mrp": "199",
          "discount": "29.65",
          "sellingPrice": "140",
          "wholeSalePrice": "140",
          "hsnCode": "5703",
          "gst": "12",
          "barcode": "816904280657"
      },
      {
          "productType": "estimated",
          "productName": "SAMARTHYA DUST BIN",
          "aliasName": "SAMARTHYA DUST BIN",
          "mrp": "417",
          "discount": "52.04",
          "sellingPrice": "200",
          "wholeSalePrice": "200",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158100857"
      },
      {
          "productType": "estimated",
          "productName": "BLEACHING POWDER 200g",
          "aliasName": "BLEACH  POWDER 200g",
          "mrp": "25",
          "discount": "20",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158100767"
      },
      {
          "productType": "estimated",
          "productName": "SAMARTHYA SOAPDISH",
          "aliasName": "SAMARTHYA SOAPDISH",
          "mrp": "66",
          "discount": "24.24",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158100765"
      },
      {
          "productType": "finished",
          "productName": "PANDADI 200g",
          "aliasName": "PANDADI 200g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280598"
      },
      {
          "productType": "finished",
          "productName": "VIJAY AGARBATTI 200g",
          "aliasName": "VIJAY AGARBATTI 200g",
          "mrp": "110",
          "discount": "27.27",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280599"
      },
      {
          "productType": "finished",
          "productName": "AVIG FESTIVAL",
          "aliasName": "AVIG FESTIVAL",
          "mrp": "50",
          "discount": "20",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280600"
      },
      {
          "productType": "finished",
          "productName": "LONG STICK",
          "aliasName": "LONG STICK",
          "mrp": "90",
          "discount": "22.22",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8906071817238"
      },
      {
          "productType": "finished",
          "productName": "KOHINOOR LOBAN 100g",
          "aliasName": "KOHINOOR LOBAN 100g",
          "mrp": "90",
          "discount": "44.44",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280601"
      },
      {
          "productType": "finished",
          "productName": "PHOOLCHHAP LOBAN 100g",
          "aliasName": "PHOOLCHHAP LOBAN 100g",
          "mrp": "60",
          "discount": "50",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280602"
      },
      {
          "productType": "finished",
          "productName": "GUGAL 100g",
          "aliasName": "GUGAL 100g",
          "mrp": "120",
          "discount": "33.33",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280603"
      },
      {
          "productType": "estimated",
          "productName": "NEHA PATLA",
          "aliasName": "NEHA PATLA",
          "mrp": "205",
          "discount": "51.22",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280604"
      },
      {
          "productType": "finished",
          "productName": "DYNA BUCKET 8 LTR",
          "aliasName": "DYNA BUCKET 8 LTR",
          "mrp": "148",
          "discount": "18.92",
          "sellingPrice": "120",
          "wholeSalePrice": "120",
          "hsnCode": "39241090",
          "gst": "18",
          "barcode": "8904114509683"
      },
      {
          "productType": "estimated",
          "productName": "SAMARTHYA FLAT MOP",
          "aliasName": "SAMARTHYA FLAT MOP",
          "mrp": "425",
          "discount": "12.94",
          "sellingPrice": "370",
          "wholeSalePrice": "370",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280605"
      },
      {
          "productType": "estimated",
          "productName": "CROWN DOORMAT",
          "aliasName": "CROWN DOORMAT",
          "mrp": "400",
          "discount": "45",
          "sellingPrice": "220",
          "wholeSalePrice": "220",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280606"
      },
      {
          "productType": "estimated",
          "productName": "SINK JALI SS",
          "aliasName": "SINK JALI SS",
          "mrp": "119",
          "discount": "57.98",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280607"
      },
      {
          "productType": "estimated",
          "productName": "SILICON GLOVES",
          "aliasName": "SILICON GLOVES",
          "mrp": "190",
          "discount": "26.32",
          "sellingPrice": "140",
          "wholeSalePrice": "140",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280608"
      },
      {
          "productType": "estimated",
          "productName": "FAN BRUSH",
          "aliasName": "FAN BRUSH",
          "mrp": "250",
          "discount": "32",
          "sellingPrice": "170",
          "wholeSalePrice": "170",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280609"
      },
      {
          "productType": "estimated",
          "productName": "SINK JALI",
          "aliasName": "SINK JALI",
          "mrp": "50",
          "discount": "60",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280610"
      },
      {
          "productType": "estimated",
          "productName": "THIRD HAND",
          "aliasName": "THIRD HAND",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280611"
      },
      {
          "productType": "finished",
          "productName": "SCOURING PAD",
          "aliasName": "SCOURING PAD",
          "mrp": "50",
          "discount": "60",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "630710",
          "gst": "18",
          "barcode": "816904280612"
      },
      {
          "productType": "estimated",
          "productName": "BALAJI LOOFAH",
          "aliasName": "BALAJI LOOFAH",
          "mrp": "70",
          "discount": "57.14",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280613"
      },
      {
          "productType": "estimated",
          "productName": "SINK BRUSH",
          "aliasName": "SINK BRUSH",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280614"
      },
      {
          "productType": "finished",
          "productName": "DYNA BUCKET 12 LTR",
          "aliasName": "DYNA BUCKET 12 LTR",
          "mrp": "218",
          "discount": "35.78",
          "sellingPrice": "140",
          "wholeSalePrice": "140",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904114509690"
      },
      {
          "productType": "estimated",
          "productName": "DOORGUARD",
          "aliasName": "DOORGUARD",
          "mrp": "35",
          "discount": "14.29",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280615"
      },
      {
          "productType": "finished",
          "productName": "SADGURU KEWDA 200g",
          "aliasName": "SADGURU KEWDA 200g",
          "mrp": "60",
          "discount": "16.67",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "816904280616"
      },
      {
          "productType": "finished",
          "productName": "POOJA PATH DRY STICK",
          "aliasName": "POOJA PATH DRY STICK",
          "mrp": "75",
          "discount": "20",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "33074100",
          "gst": "5",
          "barcode": "8906049574439"
      },
      {
          "productType": "finished",
          "productName": "FRUITS PUNCH 130g",
          "aliasName": "FRUITS PUNCH 130g",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "5",
          "barcode": "8907477001610"
      },
      {
          "productType": "finished",
          "productName": "SADGURU CAMPHOR 35g",
          "aliasName": "SADGURU CAMPHOR 35g",
          "mrp": "80",
          "discount": "12.5",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280617"
      },
      {
          "productType": "estimated",
          "productName": "CHALK LAXMANREKHA",
          "aliasName": "CHALK LAXMANREKHA",
          "mrp": "18",
          "discount": "16.67",
          "sellingPrice": "15",
          "wholeSalePrice": "15",
          "hsnCode": "",
          "gst": "0",
          "barcode": "8904058700375"
      },
      {
          "productType": "estimated",
          "productName": "WINDOW BRUSH",
          "aliasName": "WINDOW BRUSH",
          "mrp": "40",
          "discount": "50",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280618"
      },
      {
          "productType": "estimated",
          "productName": "KIDS TOOTHBRUSH",
          "aliasName": "KIDS TOOTHBRUSH",
          "mrp": "60",
          "discount": "50",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280619"
      },
      {
          "productType": "finished",
          "productName": "ZYKZ TAP CLEANER 250ml",
          "aliasName": "ZYKZ TAP CLEANER",
          "mrp": "120",
          "discount": "50",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "",
          "gst": "18",
          "barcode": "100100100643"
      },
      {
          "productType": "estimated",
          "productName": "CLIP SS",
          "aliasName": "CLIP SS",
          "mrp": "90",
          "discount": "33.33",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280620"
      },
      {
          "productType": "estimated",
          "productName": "CHOPPER",
          "aliasName": "CHOPPER",
          "mrp": "390",
          "discount": "48.72",
          "sellingPrice": "200",
          "wholeSalePrice": "200",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280621"
      },
      {
          "productType": "estimated",
          "productName": "TEA STRAINERS",
          "aliasName": "TEA STRAINERS",
          "mrp": "10",
          "discount": "50",
          "sellingPrice": "5",
          "wholeSalePrice": "5",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280622"
      },
      {
          "productType": "finished",
          "productName": "GOOD MORNING",
          "aliasName": "GOOD MORNING",
          "mrp": "16",
          "discount": "37.5",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "",
          "gst": "5",
          "barcode": "816904280623"
      },
      {
          "productType": "estimated",
          "productName": "LONG BOTTLE BRUSH 20 Ltr",
          "aliasName": "LONG BOTTLE BRUSH 20 Ltr",
          "mrp": "90",
          "discount": "33.33",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280624"
      },
      {
          "productType": "finished",
          "productName": "MT FLORA MOP",
          "aliasName": "MT FLORA MOP",
          "mrp": "190",
          "discount": "47.37",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280625"
      },
      {
          "productType": "finished",
          "productName": "MT KISSAN CLOTH SMALL",
          "aliasName": "MT KISSAN CLOTH SMALL",
          "mrp": "20",
          "discount": "50",
          "sellingPrice": "10",
          "wholeSalePrice": "10",
          "hsnCode": "6307",
          "gst": "5",
          "barcode": "816904280626"
      },
      {
          "productType": "finished",
          "productName": "MT ROSE MOP",
          "aliasName": "MT ROSE MOP",
          "mrp": "210",
          "discount": "47.62",
          "sellingPrice": "110",
          "wholeSalePrice": "110",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280627"
      },
      {
          "productType": "finished",
          "productName": "MT PLASTIC KHARATA BROOM",
          "aliasName": "MT PLASTIC KHARATA BROOM",
          "mrp": "172",
          "discount": "53.49",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280628"
      },
      {
          "productType": "finished",
          "productName": "MT TOILET BRUSH ONE SIDE",
          "aliasName": "MT TOILET BRUSH ONE SIDE",
          "mrp": "70",
          "discount": "42.86",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280629"
      },
      {
          "productType": "finished",
          "productName": "MT SLM TOILET BRUSH",
          "aliasName": "MT SLM TOILET BRUSH",
          "mrp": "120",
          "discount": "25",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280630"
      },
      {
          "productType": "finished",
          "productName": "MT BOTTLE BRUSH",
          "aliasName": "MT BOTTLE BRUSH",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280631"
      },
      {
          "productType": "finished",
          "productName": "MT TILES HANDLE SCRUBBER",
          "aliasName": "MT TILES HANDLE SCRUBBER",
          "mrp": "99",
          "discount": "39.39",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280632"
      },
      {
          "productType": "finished",
          "productName": "MT TAR BRUSH",
          "aliasName": "MT TAR BRUSH",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280633"
      },
      {
          "productType": "finished",
          "productName": "MT ROUND TOILET BRUSH WITH STAND",
          "aliasName": "MT ROUND TOILET BRUSH WITH STAND",
          "mrp": "260",
          "discount": "57.69",
          "sellingPrice": "110",
          "wholeSalePrice": "110",
          "hsnCode": "9603",
          "gst": "18",
          "barcode": "816904280634"
      },
      {
          "productType": "finished",
          "productName": "MT MUG",
          "aliasName": "MT MUG",
          "mrp": "30",
          "discount": "33.33",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280635"
      },
      {
          "productType": "finished",
          "productName": "MT BUDS",
          "aliasName": "MT BUDS",
          "mrp": "40",
          "discount": "50",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "9619",
          "gst": "12",
          "barcode": "816904280636"
      },
      {
          "productType": "finished",
          "productName": "MT RAJ CLEANWELL SCRUBBER",
          "aliasName": "MT RAJ CLEANWELL SCRUBBER",
          "mrp": "21",
          "discount": "4.76",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280637"
      },
      {
          "productType": "finished",
          "productName": "MT DISH CLOTH CLEANING PAD",
          "aliasName": "MT DISH CLOTH CLEANING PAD",
          "mrp": "40",
          "discount": "0",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "6307",
          "gst": "5",
          "barcode": "816904280638"
      },
      {
          "productType": "finished",
          "productName": "MT CLOTH BRUSH JUMBO",
          "aliasName": "MT CLOTH BRUSH JUMBO",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "4417",
          "gst": "12",
          "barcode": "816904280639"
      },
      {
          "productType": "finished",
          "productName": "MT TEA STRAINERS",
          "aliasName": "MT TEA STRAINERS",
          "mrp": "10",
          "discount": "50",
          "sellingPrice": "5",
          "wholeSalePrice": "5",
          "hsnCode": "3924",
          "gst": "18",
          "barcode": "816904280640"
      },
      {
          "productType": "finished",
          "productName": "MT XTRA LONG BROOM",
          "aliasName": "MT XTRA LONG BROOM",
          "mrp": "200",
          "discount": "40",
          "sellingPrice": "120",
          "wholeSalePrice": "120",
          "hsnCode": "9603",
          "gst": "5",
          "barcode": "816904280641"
      },
      {
          "productType": "finished",
          "productName": "SPUN  GOLD",
          "aliasName": "SPUN  GOLD",
          "mrp": "399",
          "discount": "74.94",
          "sellingPrice": "100",
          "wholeSalePrice": "100",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280642"
      },
      {
          "productType": "estimated",
          "productName": "COCROACHES GEL",
          "aliasName": "COCROACHES GEL",
          "mrp": "75",
          "discount": "0",
          "sellingPrice": "75",
          "wholeSalePrice": "75",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8904058700429"
      },
      {
          "productType": "estimated",
          "productName": "Garbage bag 30 X 50",
          "aliasName": "Garbage bag 30 X 50",
          "mrp": "140",
          "discount": "57.14",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280643"
      },
      {
          "productType": "finished",
          "productName": "CIAZ SOAP CASE",
          "aliasName": "CIAZ SOAP CASE",
          "mrp": "28",
          "discount": "28.57",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280658"
      },
      {
          "productType": "finished",
          "productName": "SUPRIYA DUST PAN SMALL",
          "aliasName": "DUST PAN SMALL",
          "mrp": "21",
          "discount": "28.57",
          "sellingPrice": "15",
          "wholeSalePrice": "15",
          "hsnCode": "39249090",
          "gst": "18",
          "barcode": "8904114500987"
      },
      {
          "productType": "finished",
          "productName": "SUPRIYA DUST PAN BIG",
          "aliasName": "SUPRIYA DUST PAN BIG",
          "mrp": "42",
          "discount": "52.38",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "39249090",
          "gst": "18",
          "barcode": "8904114500970"
      },
      {
          "productType": "finished",
          "productName": "WATER BOTTLE 1 LTR",
          "aliasName": "WATER BOTTLE 1 LTR",
          "mrp": "70",
          "discount": "42.86",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "39231090",
          "gst": "18",
          "barcode": "816904280659"
      },
      {
          "productType": "estimated",
          "productName": "PAPER SOAP",
          "aliasName": "PAPER SOAP",
          "mrp": "60",
          "discount": "33.33",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280660"
      },
      {
          "productType": "estimated",
          "productName": "PREMIUM HOOK",
          "aliasName": "PREMIUM HOOK",
          "mrp": "90",
          "discount": "44.44",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280661"
      },
      {
          "productType": "finished",
          "productName": "MT MICRO CLOTH 12",
          "aliasName": "MT MICRO CLOTH 12",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "40630",
          "gst": "12",
          "barcode": "816904280662"
      },
      {
          "productType": "finished",
          "productName": "MT GARBAGE BAGS 24/30",
          "aliasName": "MT GARBAGE BAGS 24/30",
          "mrp": "172",
          "discount": "76.74",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280663"
      },
      {
          "productType": "finished",
          "productName": "MT GARBAGE BAGS 30/50",
          "aliasName": "MT GARBAGE BAGS 30/50",
          "mrp": "200",
          "discount": "70",
          "sellingPrice": "60",
          "wholeSalePrice": "60",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280664"
      },
      {
          "productType": "estimated",
          "productName": "LEMON SQUEEZER",
          "aliasName": "LEMON SQUEEZER",
          "mrp": "276",
          "discount": "52.9",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280665"
      },
      {
          "productType": "estimated",
          "productName": "HAND MIXI",
          "aliasName": "HAND MIXI",
          "mrp": "252",
          "discount": "48.41",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280666"
      },
      {
          "productType": "estimated",
          "productName": "WOODEN BOTTLE BRUSH",
          "aliasName": "WOODEN BOTTLE BRUSH",
          "mrp": "75",
          "discount": "33.33",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280667"
      },
      {
          "productType": "estimated",
          "productName": "LIGHTER",
          "aliasName": "LIGHTER",
          "mrp": "149",
          "discount": "39.6",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280668"
      },
      {
          "productType": "finished",
          "productName": "MT FAN BRUSH",
          "aliasName": "MT FAN BRUSH",
          "mrp": "250",
          "discount": "32",
          "sellingPrice": "170",
          "wholeSalePrice": "170",
          "hsnCode": "3402",
          "gst": "18",
          "barcode": "816904280669"
      },
      {
          "productType": "estimated",
          "productName": "MINI DUSTBIN",
          "aliasName": "MINI DUSTBIN",
          "mrp": "105",
          "discount": "33.33",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158101625"
      },
      {
          "productType": "estimated",
          "productName": "SP CLOTH HANGER",
          "aliasName": "HANGER",
          "mrp": "199",
          "discount": "59.8",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280670"
      },
      {
          "productType": "estimated",
          "productName": "SAMARTHYA TAR 40g",
          "aliasName": "SAMARTHYA TAR 40g",
          "mrp": "36",
          "discount": "44.44",
          "sellingPrice": "20",
          "wholeSalePrice": "20",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8906158101212"
      },
      {
          "productType": "finished",
          "productName": "MT LAXMI GRASS BROOM BLUE",
          "aliasName": "MT LAXMI GRASS BROOM BLUE",
          "mrp": "180",
          "discount": "50",
          "sellingPrice": "90",
          "wholeSalePrice": "90",
          "hsnCode": "36031000",
          "gst": "0",
          "barcode": "816904280671"
      },
      {
          "productType": "finished",
          "productName": "MT LAXMI GRASS BROOM RED",
          "aliasName": "MT LAXMI GRASS BROOM RED",
          "mrp": "180",
          "discount": "33.33",
          "sellingPrice": "120",
          "wholeSalePrice": "120",
          "hsnCode": "36031000",
          "gst": "0",
          "barcode": "816904280672"
      },
      {
          "productType": "finished",
          "productName": "MT SUPER BRROM",
          "aliasName": "MT SUPER BRROM",
          "mrp": "211",
          "discount": "62.09",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "0",
          "barcode": "816904280673"
      },
      {
          "productType": "finished",
          "productName": "MT KHARATA JHADU",
          "aliasName": "MT KHARATA JHADU",
          "mrp": "60",
          "discount": "50",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "36031000",
          "gst": "0",
          "barcode": "816904280674"
      },
      {
          "productType": "finished",
          "productName": "MT KHARATA JHADU BIG",
          "aliasName": "MT KHARATA JHADU BIG",
          "mrp": "70",
          "discount": "42.86",
          "sellingPrice": "40",
          "wholeSalePrice": "40",
          "hsnCode": "36031000",
          "gst": "0",
          "barcode": "816904280675"
      },
      {
          "productType": "finished",
          "productName": "MT KHARATA JUMBO",
          "aliasName": "MT KHARATA JUMBO",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "36031000",
          "gst": "0",
          "barcode": "816904280676"
      },
      {
          "productType": "finished",
          "productName": "NATURAL CONCEPT UBTAN SCRUB SOAP 100G (1 PCS)",
          "aliasName": "NATURAL CONCEPT UBTAN SCRUB SOAP 100G (1 PCS)",
          "mrp": "70",
          "discount": "57.14",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "8904304750666"
      },
      {
          "productType": "finished",
          "productName": "NATURAL CONCEPT TULSI NEEM SOAP 100G (1 PCS)",
          "aliasName": "NATURAL CONCEPT TULSI NEEM SOAP 100G (1 PCS)",
          "mrp": "70",
          "discount": "57.14",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "3401",
          "gst": "18",
          "barcode": "8904304750628"
      },
      {
          "productType": "estimated",
          "productName": "Nath tall Bathroom Brush",
          "aliasName": "nath tall bathroom brush",
          "mrp": "312",
          "discount": "61.54",
          "sellingPrice": "120",
          "wholeSalePrice": "120",
          "hsnCode": "",
          "gst": "0",
          "barcode": "8908023431141"
      },
      {
          "productType": "estimated",
          "productName": "SMALL BATHROOM BRUSH",
          "aliasName": "SMALL BATHROOM BRUSH",
          "mrp": "160",
          "discount": "50",
          "sellingPrice": "80",
          "wholeSalePrice": "80",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280677"
      },
      {
          "productType": "estimated",
          "productName": "VIRGO WALL HANGER",
          "aliasName": "VIRGO WALL HANGER",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280678"
      },
      {
          "productType": "finished",
          "productName": "FANCY BOTTLE 1000",
          "aliasName": "FANCY BOTTLE 1000",
          "mrp": "200",
          "discount": "35",
          "sellingPrice": "130",
          "wholeSalePrice": "130",
          "hsnCode": "39231090",
          "gst": "18",
          "barcode": "8904220230433"
      },
      {
          "productType": "estimated",
          "productName": "STAND HOCKEY",
          "aliasName": "STAND HOCKEY",
          "mrp": "312",
          "discount": "64.74",
          "sellingPrice": "110",
          "wholeSalePrice": "110",
          "hsnCode": "",
          "gst": "18",
          "barcode": "8908023431103"
      },
      {
          "productType": "estimated",
          "productName": "HOUSEHOLD GLOVES",
          "aliasName": "GLOVES",
          "mrp": "70",
          "discount": "28.57",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280679"
      },
      {
          "productType": "estimated",
          "productName": "6 PCS HOOK",
          "aliasName": "6 PCS HOOK",
          "mrp": "80",
          "discount": "37.5",
          "sellingPrice": "50",
          "wholeSalePrice": "50",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280680"
      },
      {
          "productType": "estimated",
          "productName": "CARPET BRUSH",
          "aliasName": "CARPET BRUSH",
          "mrp": "90",
          "discount": "22.22",
          "sellingPrice": "70",
          "wholeSalePrice": "70",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280681"
      },
      {
          "productType": "estimated",
          "productName": "SOAP CASE",
          "aliasName": "SOAP CASE",
          "mrp": "50",
          "discount": "40",
          "sellingPrice": "30",
          "wholeSalePrice": "30",
          "hsnCode": "",
          "gst": "18",
          "barcode": "816904280682"
      }
      
  ]
    const bulkproduct = async (req, res) => {
      try {
          // Destructure the fields from the request body
          const bulkprodcts = bulkproductobj;
          const exists = [];
          const newe = [];
          // Validate required fields
          for(const bulk of bulkprodcts){
            
            const existingProduct = await product.findOne({
            where: { barcode: bulk.barcode },
            });
            if (existingProduct) {
              exists.push(bulk)
            }
    
            // Create a new product
            const newProduct = await product.create({
            productName: bulk.productName,
            aliasName: bulk.aliasName,
            barcode: bulk.barcode,
            productType: bulk.productType,
            img:"../../../../assets/img/products/chinki-product-none.png",
            mrp: bulk.mrp,
            discount: bulk.discount,
            sellingPrice: bulk.sellingPrice,
            wholeSalePrice: bulk.wholeSalePrice,
            gst: bulk.gst,
            hsnCode: bulk.hsnCode,
            status: bulk.status,
            category: "others"
            });
            newe.push(bulk)
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
    
          }
         const length = exists.length;
          // Respond with the created product
          return res
          .status(200)
          .json(
              new ApiResponse(
              200,
              {
                newe: newe,
                newelen: newe.length,
                existings: exists,
                existingsleng: length,
              },
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
  

export { createProduct, getProduct, updateProduct, deleteProduct, allProduct, productStats, bulkproduct };
