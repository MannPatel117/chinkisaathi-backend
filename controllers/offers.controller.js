import { Offer } from "../model/offers.model.js";
import { product } from "../model/product.model.js";
import { Coupon } from "../model/coupons.model.js";
import { Op } from "sequelize";
import crypto from "crypto";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create Offer
const createOffer = async (req, res) => {
  try {
    const { offerName, offerType,discountPerc, minOrderValue, discountAmount, freeProductID, inventory } = req.body;

    const newOffer = await Offer.create({
      offerName,
      offerType,
      minOrderValue,
      discountPerc,
      discountAmount,
      freeProductID,
      inventory,
      isActive: true,
      isCoupon: false
    });

    return res
          .status(201)
          .json(new ApiResponse(201, newOffer, "Offer created successfully", true));
  } catch (error) {
    console.error("Error creating offer:", error);
    return res
              .status(500)
              .json(new ApiResponse(500, "Something went wrong", "Error", false));
  }
};


const editOffer = async (req, res) => {
    try {
      const { offerID } = req.params; // Get the offer ID from request params
      const { offerType, minOrderValue, discountAmount, freeProductID, inventory, isActive } = req.body;
  
      const offer = await Offer.findByPk(offerID);
      if (!offer) {
        return res.status(404).json(new ApiResponse(404, null, "Offer not found", false));
      }
  
      await offer.update({
        offerType,
        minOrderValue,
        discountAmount,
        freeProductID,
        inventory,
        isActive
      });
  
      return res.status(200).json(new ApiResponse(200, offer, "Offer updated successfully", true));
    } catch (error) {
      console.error("Error updating offer:", error);
      return res.status(500).json(new ApiResponse(500, "Something went wrong", "Error", false));
    }
  };

  const deleteOffer = async (req, res) => {
    try {
      const { offerID } = req.params;
  
      const offer = await Offer.findByPk(offerID);
      if (!offer) {
        return res.status(404).json(new ApiResponse(404, null, "Offer not found", false));
      }
  
      await offer.destroy();
  
      return res.status(200).json(new ApiResponse(200, null, "Offer deleted successfully", true));
    } catch (error) {
      console.error("Error deleting offer:", error);
      return res.status(500).json(new ApiResponse(500, "Something went wrong", "Error", false));
    }
  };

  const getOffer = async (req, res) => {
    try {
      const { offerID } = req.params;
      const includeProduct = {
        model: product,
        as: "FreeProduct",
        attributes: ["productID", "productName", "barcode"], // Only fetch necessary fields
        required: false, // Don't filter out offers without a free product
    };
    
      const offer = await Offer.findOne({where:{offerID:offerID}, include: [includeProduct]});
      if (!offer) {
        return res.status(404).json(new ApiResponse(404, null, "Offer not found", false));
      }
  
      return res.status(200).json(new ApiResponse(200, offer, "Offer retrieved successfully", true));
    } catch (error) {
      console.error("Error fetching offer:", error);
      return res.status(500).json(new ApiResponse(500, "Something went wrong", "Error", false));
    }
  };
  

// Get All Offers
const getOffers = async (req, res) => {
  try {
    const { pagination, page, limit, status, search, offerType, isCoupon } = req.query;
    if (pagination === 'true') {
        // Parse page and limit parameters or set defaults
        const pageNumber = parseInt(page, 10) || 1; // Default to page 1
        const pageSize = parseInt(limit, 10) || 10; // Default to 10 items per page
        const offset = (pageNumber - 1) * pageSize;
  
        // Build query with filters
        const query = {  };
  
        if (status) {
        const boolStatus = JSON.parse(status)
          query.isActive = boolStatus;
        }

        if (isCoupon) {
            const boolStatus = JSON.parse(isCoupon)
              query.isCoupon = boolStatus;
            }

        if (offerType) {
            query.offerType = offerType;
          }
  
        if (search) {
                query[Op.or] = [
                  { offerName: { [Op.like]: `%${search}%` } }
                ];
        }

        const includeProduct = {
            model: product,
            as: "FreeProduct",
            attributes: ["productID", "productName", "barcode"], // Only fetch necessary fields
            required: false, // Don't filter out offers without a free product
        };
        // Fetch paginated data
        const { count, rows } = await Offer.findAndCountAll({
          offset: offset,
          limit: pageSize,
          where: query,
          include: [includeProduct],
          order: [["createdAt", "DESC"]]
        });
  
        return res
          .status(200)
          .json(
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
              "Offers fetched successfully",
              true
            )
          );
      } else {
        // Build query with filters for non-paginated request
        const query = {  };
  
        if (status) {
            const boolStatus = JSON.parse(status)
            query.isActive = boolStatus;
        }

        if (offerType) {
            query.offerType = offerType;
          }
  
        if (search) {
                query[Op.or] = [
                  { offerName: { [Op.like]: `%${search}%` } }
                ];
        }

        if (isCoupon) {
            const boolStatus = JSON.parse(isCoupon)
              query.isCoupon = boolStatus;
            }

        const includeProduct = {
            model: product,
            as: "FreeProduct",
            attributes: ["productID", "productName", "barcode"], // Only fetch necessary fields
            required: false, // Don't filter out offers without a free product
        };
  
        const offers = await Offer.findAll({
          where: query,
          include: [includeProduct],
          order: [["createdAt", "DESC"]]
        });
  
        return res
          .status(200)
          .json(new ApiResponse(200, offers, "All offers fetched successfully", true));
      }
    } catch (error) {
      console.error("Error fetching accounts", error);
      return res
        .status(500)
        .json(new ApiResponse(500, "Please contact support", "Server Error", false));
    }
};


const offerStats = async (req, res) => {
    try {
        const activeCount = await Offer.count({
            where: { isActive: true },
        });

        const totalCount = await Offer.count();

        return res
                .status(200)
                .json(new ApiResponse(200, 
                    {"activeCount": activeCount, "totalCount": totalCount}, "Offer Stats", true));
    } catch (error) {
        console.error('Error fetching stats', error);
              return res
              .status(500)
              .json(new ApiResponse(500, "Please contact Mann", "Server Error", false));
    }
  };


  const generateCoupons = async (req, res) => {
    try {
      const { offerID, quantity } = req.body;
  
      if (!offerID || !quantity) {
        return res.status(400).json({ success: false, message: "Offer ID and quantity are required" });
      }
  
      // Check if the offer exists
      const offer = await Offer.findByPk(offerID);
      if (!offer) {
        return res.status(404).json({ success: false, message: "Offer not found" });
      }
  
      const generatedCoupons = new Set();
  
      while (generatedCoupons.size < quantity) {
        let code = crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 7);
        if (!(await Coupon.findOne({ where: { couponID: code } }))) {
          generatedCoupons.add(code);
        }
      }
  
      const couponData = [...generatedCoupons].map((coupon) => ({ couponID: coupon, offerID }));
      console.log(couponData)
      await Coupon.bulkCreate(couponData);
  
      // ✅ Update isCoupon field in Offer model
      if (!offer.isCoupon) {
        await offer.update({ isCoupon: true });
      }
  
      return res
      .status(200)
      .json(new ApiResponse(200, 
          couponData, "Coupons generated", true));
    } catch (error) {
      console.error("Error generating coupons:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };

  const getCouponsByOfferId = async (req, res) => {
    try {
      const { offerID } = req.params;
  
      const coupon = await Coupon.findAll({where:{
        offerID: offerID
      }});
      if (!coupon) {
        return res.status(404).json(new ApiResponse(404, null, "Coupon not found", false));
      }
      return res.status(200).json(new ApiResponse(200, coupon, "Coupon retrieved successfully", true));
      
    } catch (error) {
      console.error("Error fetching Coupon:", error);
      return res.status(500).json(new ApiResponse(500, "Something went wrong", "Error", false));
    }
  };

  const getCouponsByCouponId = async (req, res) => {
    try {
      const { offerID } = req.params;
  
      const coupon = await Coupon.findAll({where:{
        couponID: offerID
      }});
      if (!coupon) {
        return res.status(404).json(new ApiResponse(404, null, "Coupon not found", false));
      }
      console.log(coupon)
      if(coupon.isRedeemed == true){
        return res.status(200).json(new ApiResponse(200, [], "Already used", true));
      } else {
        return res.status(200).json(new ApiResponse(200, coupon, "Coupon retrieved successfully", true));
      } 
      
    } catch (error) {
      console.error("Error fetching Coupon:", error);
      return res.status(500).json(new ApiResponse(500, "Something went wrong", "Error", false));
    }
  };
export { createOffer, getOffer, editOffer, deleteOffer, getOffers, offerStats, generateCoupons, getCouponsByOfferId, getCouponsByCouponId}
