import { ApiResponse } from "../utils/ApiResponse.js";
import { Offer } from "../model/offers.model.js";
import { Coupon } from "../model/coupons.model.js";
import { billTransactionDetails } from "../model/billTransactionDetails.model.js";
import { Inventory } from '../model/inventory.model.js';
import { product } from "../model/product.model.js";
import { InventoryDetails } from '../model/inventoryDetails.modell.js'
import { Op } from "sequelize";
import { BillMaster } from "../model/bills.model.js";
import { initialSequelize } from "../utils/sql.js";
import InventoryTransaction from "../model/inventoryTransaction.model.js";
import User from "../model/users.model.js";
import { RewardsPoint } from "../model/rewardPoints.model.js";

/*
    Function Name - createBill
    Functionality - Create Bill - This creates bill and affects almost all models
*/

const createBill = async (req, res) => {

    const body = req.body;
    const sequelize = initialSequelize();
    const t = await (await sequelize).transaction();
    try {
            const inventoryRecord = await Inventory.findByPk(body.location)
            if (!inventoryRecord) {
                res.status(400).json(new ApiResponse(400, "Inventory not found", "Please try again", false))
            }

            const finishedBill = body.BillFinished;
            let currentInvoice = inventoryRecord.invoiceNumber;
            if(finishedBill.length > 0){
                currentInvoice = inventoryRecord.invoiceNumber+1;
            }
            let currentBill = inventoryRecord.billNumber;

            let billNumber = parseInt(currentBill.split("-")[1])+1;
            let abri = inventoryRecord.inventoryNameAbbri;
            let currentBillNumber = `${abri}-${billNumber.toString().padStart(4, "0")}`;
            inventoryRecord.billNumber = `${abri}-${billNumber.toString().padStart(4, "0")}`;
            inventoryRecord.invoiceNumber= currentInvoice;

            await inventoryRecord.save({ transaction: t });

            let user = null;
            if(body.UserPhnNumber != ''){
                user = body.UserPhnNumber;
                console.log("User")
            }
            let supplier = null;
            if(body.supplier !='' && body.supplier != null && body.supplier !=undefined){
                supplier = body.supplier;
                console.log("Sup")
            }
            console.log(body)
            let customerType = "new";
            if(body.CustomerType != ''){
                customerType = body.CustomerType;
                console.log("below is ct")
                console.log(body.customerType)
            }
            let offer = null;
            const offerObj = body.currentOffer;
            if(offerObj.offerID !=''){
                offer = offerObj.offerID
            }
            let coupon = null;
            if(offerObj.couponID !=''){
                coupon = offerObj.couponID
            }
            const newBill = await BillMaster.create({
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
                couponID: coupon
            }, { transaction: t })

            const billDetail = body.BillDetails;

            for (const detail of billDetail) {
                const { productName,
                    quantity,
                    mrp,
                    discount,
                    rate,
                    amount,
                    gst,
                    gstAmount,
                    finalAmount,
                    productID,
                    productType} = detail;
           
                let cgstAmount = 0;
                if (gstAmount > 0) {
                    cgstAmount = (gstAmount / 2).toFixed(2);
                }


                await billTransactionDetails.create({
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
                    netAmount: finalAmount
                }, { transaction: t });
                            
                // Update Inventory Details
                const inventoryDetail = await InventoryDetails.findOne({
                    where: { inventoryID: body.location, productID: productID },
                    transaction: t
                });
                            
                if (inventoryDetail) {
                    inventoryDetail.quantity -= quantity; // Increase product quantity
                    await inventoryDetail.save({ transaction: t });
                } else {
                    // Create new InventoryDetails record if not exists
                    await InventoryDetails.create({
                        inventoryID: body.location,
                        productID: productID,
                        quantity: -quantity
                    }, { transaction: t });
                }
                await InventoryTransaction.create({
                    inventoryID: body.location,
                    productID: productID,
                    billID: newBill.billID,
                    quantity: quantity,
                    type: 'subtract',
                    reason: "Sale",
                }, { transaction: t })
             }

            if(body.UserPhnNumber != ''){
                const userData = await User.findByPk(body.UserPhnNumber);
                let currentRewardPoints = userData.rewardPoint;
                let calcEarnedPoint = parseFloat((body.totalAmount / 1000).toFixed(2));
                if(body.RedeemPoints > 0){
                    await RewardsPoint.create({
                        billID: newBill.billID,
                        phoneNumber: body.UserPhnNumber,
                        pointsAmount: -body.RedeemPoints
                    }, { transaction: t })

                    currentRewardPoints = currentRewardPoints - body.RedeemPoints;
                }
                await RewardsPoint.create({
                    billID: newBill.billID,
                    phoneNumber: body.UserPhnNumber,
                    pointsAmount: calcEarnedPoint
                }, { transaction: t })
                console.log(calcEarnedPoint);
                currentRewardPoints = currentRewardPoints + calcEarnedPoint;

                userData.rewardPoint = currentRewardPoints;

                await userData.save({ transaction: t });
            }

            if(offerObj.offerID !=''){
                offer = offerObj.offerID;
                if(offerObj.isCoupon == true && offerObj.couponID !=''){
                    const couponData = await Coupon.findByPk(offerObj.couponID);
                    couponData.isRedeemed = true;
                    await couponData.save({ transaction: t })
                }
            }

            await t.commit();
            return res.status(201).json(new ApiResponse(201, newBill, "Bill saved successfully", true));
    }
    catch(error){
        await t.rollback();
        console.error(error)
        return res.status(500).json(new ApiResponse(500, {}, "Failed to save bill", false));
    }
    
}


export {createBill}