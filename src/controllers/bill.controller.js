import { ApiResponse } from "../utils/ApiResponse.js";
import { Offer } from "../model/offers.model.js";
import { Coupon } from "../model/coupons.model.js";
import { billTransactionDetails } from "../model/billTransactionDetails.model.js";
import { Inventory } from "../model/inventory.model.js";
import { product } from "../model/product.model.js";
import { InventoryDetails } from "../model/inventoryDetails.modell.js";
import { Op } from "sequelize";
import { BillMaster } from "../model/bills.model.js";
import { initialSequelize } from "../utils/sql.js";
import InventoryTransaction from "../model/inventoryTransaction.model.js";
import User from "../model/users.model.js";
import { RewardsPoint } from "../model/rewardPoints.model.js";
import moment from "moment-timezone";
/*
    Function Name - createBill
    Functionality - Create Bill - This creates bill and affects almost all models
*/

const createBill = async (req, res) => {
    const body = req.body;
    const sequelize = initialSequelize();
    const t = await (await sequelize).transaction();
    try {
      // 🟢 Lock the row to prevent concurrent updates
      const inventoryRecord = await Inventory.findOne({
        where: { inventoryID: body.location },
        transaction: t,
        lock: t.LOCK.UPDATE, // ✅ Row-level lock
      });
  
      if (!inventoryRecord) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, "Inventory not found", "Please try again", false)
          );
      }
  
      // 🔥 Ensure correct invoice and bill number generation
      const finishedBill = body.BillFinished;
      let currentInvoice = inventoryRecord.invoiceNumber;
      if (finishedBill.length > 0) {
        currentInvoice = inventoryRecord.invoiceNumber + 1;
      }
      let currentBill = inventoryRecord.billNumber;
  
      let billNumber = parseInt(currentBill.split("-")[1]) + 1;
      let abri = inventoryRecord.inventoryNameAbbri;
      let currentBillNumber = `${abri}-${billNumber.toString().padStart(4, "0")}`;
      inventoryRecord.billNumber = currentBillNumber;
      inventoryRecord.invoiceNumber = currentInvoice;
  
      // 🟢 Save updated inventory with locked transaction
      await inventoryRecord.save({ transaction: t });
  
      let user = null;
      if (body.UserPhnNumber != "") {
        user = body.UserPhnNumber;
      }
  
      let supplier = null;
      if (body.supplier != "" && body.supplier != null) {
        supplier = body.supplier;
      }
  
      let customerType = "new";
      if (body.CustomerType != "") {
        customerType = body.CustomerType;
      }
  
      let offer = null;
      const offerObj = body.currentOffer;
      if (offerObj.offerID != "") {
        offer = offerObj.offerID;
      }
  
      let coupon = null;
      if (offerObj.couponID != "") {
        coupon = offerObj.couponID;
      }
  
      // 🟢 Create new bill after generating unique invoiceNumber and billNumber
      const newBill = await BillMaster.create(
        {
          inventoryID: body.location,
          phoneNumber: user,
          supplier: supplier,
          invoiceNumber: currentInvoice,
          billNumber: currentBillNumber,
          customerType: customerType,
          paymentType: body.PaymentType,
          finalAmount: body.totalAmount,
          finalAmountF: body.totalAmountF,
          rewardPointsUsed: body.RedeemPoints,
          offerID: offer,
          couponID: coupon,
        },
        { transaction: t }
      );
  
      // 🟢 Create Bill Details and Update Inventory
      const billDetail = body.BillDetails;
      for (const detail of billDetail) {
        const {
          productName,
          quantity,
          mrp,
          discount,
          rate,
          amount,
          gst,
          gstAmount,
          finalAmount,
          productID,
          productType,
        } = detail;
  
        let cgstAmount = 0;
        if (gstAmount > 0) {
          cgstAmount = (gstAmount / 2).toFixed(2);
        }
  
        await billTransactionDetails.create(
          {
            billID: newBill.billID,
            productID,
            quantity,
            productName,
            productType,
            mrp,
            discountPerc: discount,
            rate,
            amount,
            gstPerc: gst,
            cgstAmount: cgstAmount,
            sgstAmount: cgstAmount,
            igstAmount: 0,
            netAmount: finalAmount,
          },
          { transaction: t }
        );
  
        // 🟢 Update Inventory Details with locked transaction
        const inventoryDetail = await InventoryDetails.findOne({
          where: { inventoryID: body.location, productID: productID },
          transaction: t,
          lock: t.LOCK.UPDATE, // Lock inventory row for safety
        });
  
        if (inventoryDetail) {
          inventoryDetail.quantity -= quantity; // Decrease product quantity
          await inventoryDetail.save({ transaction: t });
        } else {
          // Create new InventoryDetails record if not exists
          await InventoryDetails.create(
            {
              inventoryID: body.location,
              productID: productID,
              quantity: -quantity,
            },
            { transaction: t }
          );
        }
  
        // Log Inventory Transaction
        await InventoryTransaction.create(
          {
            inventoryID: body.location,
            productID: productID,
            billID: newBill.billID,
            quantity: quantity,
            type: "subtract",
            reason: "Sale",
          },
          { transaction: t }
        );
      }
  
      // 🟢 Handle User Rewards Points
      if (body.UserPhnNumber != "") {
        const userData = await User.findByPk(body.UserPhnNumber, {
          transaction: t,
          lock: t.LOCK.UPDATE, // Lock user row for concurrent transactions
        });
  
        let currentRewardPoints = userData.rewardPoint;
        let calcEarnedPoint = parseFloat((body.totalAmount / 1000).toFixed(2));
  
        if (body.RedeemPoints > 0) {
          await RewardsPoint.create(
            {
              billID: newBill.billID,
              phoneNumber: body.UserPhnNumber,
              pointsAmount: -body.RedeemPoints,
            },
            { transaction: t }
          );
  
          currentRewardPoints -= body.RedeemPoints;
        }
  
        await RewardsPoint.create(
          {
            billID: newBill.billID,
            phoneNumber: body.UserPhnNumber,
            pointsAmount: calcEarnedPoint,
          },
          { transaction: t }
        );
  
        currentRewardPoints += calcEarnedPoint;
        userData.rewardPoint = currentRewardPoints;
        await userData.save({ transaction: t });
      }
  
      // 🟢 Handle Offer Coupon Redemption
      if (offerObj.offerID != "") {
        offer = offerObj.offerID;
        if (offerObj.isCoupon == true && offerObj.couponID != "") {
          const couponData = await Coupon.findByPk(offerObj.couponID, {
            transaction: t,
            lock: t.LOCK.UPDATE, // Lock coupon row to prevent duplication
          });
  
          couponData.isRedeemed = true;
          await couponData.save({ transaction: t });
        }
      }
  
      // ✅ Commit transaction after all operations
      await t.commit();
      return res
        .status(201)
        .json(new ApiResponse(201, newBill, "Bill saved successfully", true));
    } catch (error) {
      await t.rollback();
      console.error("Error creating bill:", error);
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to save bill", false));
    }
  };
  
const editBill = async (req, res) => {
  try {
    const { billID } = req.params; // ID of the transaction to update
    const body = req.body;
    if (!billID) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Transaction ID is required", false));
    }

    const sequelize = initialSequelize();
    const t = await (await sequelize).transaction();

    try {
      const existingBill = await BillMaster.findByPk(billID, {
        transaction: t,
      });

      if (!existingBill) {
        return res
          .status(404)
          .json(new ApiResponse(404, {}, "Bill not found", false));
      }

      let user = null;
      if (body.UserPhnNumber != "") {
        user = body.UserPhnNumber;
      }
      let supplier = null;
      if (
        body.supplier != "" &&
        body.supplier != null &&
        body.supplier != undefined
      ) {
        supplier = body.supplier;
      }
      console.log(body);
      let customerType = "new";
      if (body.CustomerType != "") {
        customerType = body.CustomerType;
      }
      let offer = null;
      const offerObj = body.currentOffer;
      if (offerObj.offerID != "") {
        offer = offerObj.offerID;
      }
      let coupon = null;
      if (offerObj.couponID != "") {
        coupon = offerObj.couponID;
      }
      existingBill.set({
        phoneNumber: user,
        supplier: supplier,
        customerType: customerType,
        paymentType: body.PaymentType,
        finalAmount: body.totalAmount,
        finalAmountF: body.totalAmountF,
        rewardPointsUsed: body.RedeemPoints,
        offerID: offer,
      });

      await existingBill.save({ transaction: t });

      const billDetailsOld = await billTransactionDetails.findAll({
        where: { billID: billID },
        transaction: t,
      });

      // Remove existing transaction details
      await billTransactionDetails.destroy({
        where: { billID: billID },
        transaction: t,
      });

      // Restore inventory before updating
      for (const oldDetail of billDetailsOld) {
        const inventoryDetail = await InventoryDetails.findOne({
          where: { inventoryID: body.location, productID: oldDetail.productID },
          transaction: t,
        });

        if (inventoryDetail) {
          inventoryDetail.quantity += oldDetail.quantity;
          await inventoryDetail.save({ transaction: t });
        }
      }
      await InventoryTransaction.destroy({
        where: { billID: billID },
        transaction: t,
      });
      for (const detail of body.BillDetails) {
        const {
          productName,
          quantity,
          mrp,
          discount,
          rate,
          amount,
          gst,
          gstAmount,
          finalAmount,
          productID,
          productType,
        } = detail;

        let cgstAmount = 0;
        if (gstAmount > 0) {
          cgstAmount = (gstAmount / 2).toFixed(2);
        }

        await billTransactionDetails.create(
          {
            billID: existingBill.billID,
            productID,
            quantity,
            productName,
            productType,
            mrp,
            discountPerc: discount,
            rate,
            amount,
            gstPerc: gst,
            cgstAmount: cgstAmount,
            sgstAmount: cgstAmount,
            igstAmount: 0,
            netAmount: finalAmount,
          },
          { transaction: t }
        );

        // Update Inventory Details
        const inventoryDetail = await InventoryDetails.findOne({
          where: { inventoryID: body.location, productID: productID },
          transaction: t,
        });

        if (inventoryDetail) {
          inventoryDetail.quantity -= quantity; // Increase product quantity
          await inventoryDetail.save({ transaction: t });
        } else {
          // Create new InventoryDetails record if not exists
          await InventoryDetails.create(
            {
              inventoryID: body.location,
              productID: productID,
              quantity: -quantity,
            },
            { transaction: t }
          );
        }
        await InventoryTransaction.create(
          {
            inventoryID: body.location,
            productID: productID,
            billID: existingBill.billID,
            quantity: quantity,
            type: "subtract",
            reason: "Sale",
          },
          { transaction: t }
        );
      }
      if (body.UserPhnNumber != "") {
        const userData = await User.findByPk(body.UserPhnNumber);
        let currentRewardPoints = userData.rewardPoint;
        const RewardPointsOld = await RewardsPoint.findAll({
            where: { billID: billID },
            transaction: t,
        });
        await RewardsPoint.destroy({
            where: { billID: billID },
            transaction: t,
        });
        console.log(RewardPointsOld[0].pointsAmount)
        for(let i=0; i < RewardPointsOld.length; i++){
          console.log(RewardPointsOld[i].pointsAmount)
            if(RewardPointsOld[i].pointsAmount < 0){
                currentRewardPoints = currentRewardPoints + (-(RewardPointsOld[i].pointsAmount));
            } else{
                currentRewardPoints = currentRewardPoints - RewardPointsOld[i].pointsAmount;
            }
        }
        let calcEarnedPoint = parseFloat((body.totalAmount / 1000).toFixed(2));
        if (body.RedeemPoints > 0) {
          await RewardsPoint.create(
            {
              billID: existingBill.billID,
              phoneNumber: body.UserPhnNumber,
              pointsAmount: -body.RedeemPoints,
            },
            { transaction: t }
          );
  
          currentRewardPoints = currentRewardPoints - body.RedeemPoints;
        }
        await RewardsPoint.create(
          {
            billID: existingBill.billID,
            phoneNumber: body.UserPhnNumber,
            pointsAmount: calcEarnedPoint,
          },
          { transaction: t }
        );

        currentRewardPoints = currentRewardPoints + calcEarnedPoint;
  
        userData.rewardPoint = currentRewardPoints;
  
        await userData.save({ transaction: t });
      }
  
      await t.commit();
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            existingBill,
            "Bill updated successfully",
            true
          )
        );
    } catch (error) {
      await t.rollback();
      console.error("Error in editBill:", error);
      return res
        .status(500)
        .json(new ApiResponse(500, {}, "Failed to update Bill", false));
    }
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to update Bill", false));
  }
};


const getBillById = async (req, res) => {
    try {
      const { billID } = req.params;
  
      const bill = await BillMaster.findOne({
        where: { billID },
        include: [
          {
            model: billTransactionDetails,
            as: "billDetails",
            include: [
              {
                model: product,
                attributes: ["productName"],
              },
            ],
          },
          {
            model: User, // ✅ Join Inventory to get inventory name
            as: "User", // ✅ Fetch only inventory name
        },
        {
          model: Offer, // ✅ Join Inventory to get inventory name
          as: "Offer", // ✅ Fetch only inventory name
      },
        ],
      });
  
      if (!bill) {
        return res.status(404).json({ success: false, message: "Bill not found" });
      }
  
      res.status(200).json({ success: true, data: bill });
    } catch (error) {
      console.error("Error fetching bill by ID:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  
  // 🟢 Get All Bills with Pagination & Search by Phone Number
  const getAllBills = async (req, res) => {
    try {
      const { page = 1, limit = 10, pagination = "false", search, inventory, toDate, fromDate, dateField = 'createdAt', paymentType, } = req.query;
        const query = {}
        const paymentTypeArr = JSON.parse(paymentType);
        const inventoryArr = JSON.parse(inventory);
      // Define search condition if phoneNumber is provided
      if (search) {
        query[Op.or] = [
          { invoiceNumber: { [Op.like]: `%${search}%` } },
          { billNumber: { [Op.like]: `%${search}%` } },
          { phoneNumber: { [Op.like]: `%${search}%` } },
        ];
      }
      if (paymentTypeArr.length > 0) {
        query.paymentType = { [Op.in]: paymentTypeArr };
    }
        if (inventoryArr.length > 0) {
            query.inventoryID = { [Op.in]: inventoryArr };
        }

        if (inventoryArr.length <= 0) {
            query.inventoryID = { [Op.in]: 0 };
        }

        let startDate = fromDate;
        let endDate = toDate || new Date();

        if (startDate && endDate) {
                    // Convert to UTC to ensure consistency between frontend and backend
                    startDate = moment(startDate).tz('Asia/Kolkata', true).startOf('day').toDate();
                    endDate = moment(endDate).tz('Asia/Kolkata', true).endOf('day').toDate();
        
                    if (new Date(startDate).getTime() === new Date(endDate).getTime()) {
                        query[dateField] = { [Op.gte]: new Date(startDate) };
                    } else {
                        query[dateField] = {
                            [Op.between]: [new Date(startDate), new Date(endDate)]
                        };
                    }
                }

      let result;
      if (pagination === "true") {
   
        const offset = (parseInt(page) - 1) * parseInt(limit);
        result = await BillMaster.findAndCountAll({
          where: query,
          include: [
            {
              model: billTransactionDetails,
              as: "billDetails",
            },
            {
                model: Inventory, // ✅ Join Inventory to get inventory name
                as: "Inventory",
                attributes: ["inventoryName"], // ✅ Fetch only inventory name
            },
          ],
          distinct: true,
          limit: parseInt(limit),
          offset,
          order: [["createdAt", "DESC"]],
        });
        return res
                .status(200)
                .json(new ApiResponse(200, 
                  { 
                    pagination: {
                        totalRecords: result.count,
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(result.count / parseInt(limit)),
                    },
                    data: result.rows
                  }, "Account Transaction fetched", true));
      } else {
        // Return all records without pagination
        result = await BillMaster.findAll({
          where: whereCondition,
          include: [
            {
              model: billTransactionDetails,
              as: "billDetails",
              include: [
                {
                  model: product,
                  attributes: ["productName"],
                },
              ],
            },
          ],
          order: [["createdAt", "DESC"]],
        });
  
        res.status(200).json({
          success: true,
          data: result,
        });
      }
    } catch (error) {
      console.error("Error fetching all bills:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  const getTotalSalesForPreviousDay = async (req, res) => {
    try {
      const { 
        inventory,  // ✅ Now supports array 
    } = req.query;
      // Get the date for yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));
      const inventoryArr = JSON.parse(inventory);
      // Query to calculate the total sales of the previous day
      let totalSales = await BillMaster.sum("finalAmount", {
        where: {
          createdAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
          inventoryID:{
            [Op.in]: inventoryArr
          }
        },
      });
      const sales = await BillMaster.findAll({
        where: {
          createdAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
          inventoryID:{
            [Op.in]: inventoryArr
          }
        },
      })
      console.log(sales)
      console.log(totalSales)
      if(totalSales == null){
        totalSales= 0;
      }
     
      return res
                .status(200)
                .json(new ApiResponse(200, 
                  totalSales, "Stats fetched", true));
    } catch (error) {
      console.error("Error fetching total sales:", error);
      throw error;
    }
  };
  

export { createBill, editBill, getBillById, getAllBills, getTotalSalesForPreviousDay };
