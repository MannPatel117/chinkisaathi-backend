import { ApiResponse } from "../utils/ApiResponse.js";
import { AccountsTransaction } from "../model/accountTransaction.model.js";
import { initialSequelize } from "../utils/sql.js"; 
import { Inventory } from "../model/inventory.model.js";
import {InventoryDetails} from "../model/inventoryDetails.modell.js";
import { AccountsTransactionDetails } from "../model/accountTransactionDetails.model.js";
import { InventoryTransaction } from "../model/inventoryTransaction.model.js";
import { Account } from "../model/account.model.js";
import { Sequelize } from "sequelize";
import { Op } from "sequelize";
import moment from "moment-timezone";
import { product } from "../model/product.model.js";

/*
    Function Name - createAccountTransaction
    Functionality - Creates Account Transaction - This also creates account transaction details if required and modify the inventory accordingly
*/

const createAccountTransaction = async (req, res) => {
    try{
        const {
            transactionType
        } = req.body
        if(transactionType == 'purchase'){
            const sequelize = initialSequelize();
            const t = await (await sequelize).transaction();
            try {
                const {
                    transactionType,
                    inventory,
                    supplier,
                    challanNumber,
                    challanDate,
                    billNumber,
                    billDate,
                    finalAmt,
                    transactionDetail,
                    remark
                } = req.body;

                const inventoryRecord = await Inventory.findByPk(inventory, { transaction: t });

                if (!inventoryRecord) {
                    res.status(400).json(new ApiResponse(400, "Inventory not found", "Please try again", false))
                }

                let currentGR = inventoryRecord.goodsReceiptDocNo; 
                let grNumber = parseInt(currentGR.split("-")[1]) + 1; 
                inventoryRecord.goodsReceiptDocNo = `GR-${grNumber.toString().padStart(3, "0")}`; 
                await inventoryRecord.save({ transaction: t });
                // Create Account Transaction
                const newTransaction = await AccountsTransaction.create({
                    transactionType,
                    inventory,
                    documentNumber: currentGR,
                    supplier,
                    challanNumber,
                    challanDate,
                    billNumber,
                    billDate,
                    finalAmt,
                    remark,
                    actionBy: req.user.firstName
                }, { transaction: t });
        
                // Insert each product in transactionDetail into AccountsTransactionDetails
                for (const detail of transactionDetail) {
                    const { productID, quantity, discountAmt, amount, wholeSalePrice, cgstAmount, sgstAmount, igstAmount, netAmount } = detail;
                    
                    await AccountsTransactionDetails.create({
                        accountTransaction: newTransaction.transactionID,
                        productID,
                        quantity,
                        discountAmt,
                        amount,
                        wholeSalePrice,
                        cgstAmount,
                        sgstAmount,
                        igstAmount,
                        netAmount
                    }, { transaction: t });
                    
                    // Update Inventory Details
                    const inventoryDetail = await InventoryDetails.findOne({
                        where: { inventoryID: inventory, productID: productID },
                        transaction: t
                    });
                    
                    if (inventoryDetail) {
                        inventoryDetail.quantity += quantity; // Increase product quantity
                        await inventoryDetail.save({ transaction: t });
                    } else {
                        // Create new InventoryDetails record if not exists
                        await InventoryDetails.create({
                            inventoryID: inventory,
                            productID: productID,
                            quantity
                        }, { transaction: t });
                    }

                    await InventoryTransaction.create({
                        inventoryID: inventory,
                        productID: productID,
                        accountTransactionID: newTransaction.transactionID,
                        quantity: quantity,
                        type: 'add',
                        reason: 'GOODS RECEIPT :'+ currentGR,
                    }, { transaction: t })
                }
        
                await t.commit();
                return res.status(201).json(new ApiResponse(201, newTransaction, "Transaction created successfully", true));
            } catch (error) {
                await t.rollback();
                console.error("Error in createAccountTransaction:", error);
                return res.status(500).json(new ApiResponse(500, {}, "Failed to create transaction", false));
            }

        } else if(transactionType == 'payment'){
            const sequelize = initialSequelize();
            const t = await (await sequelize).transaction();
            const {
                transactionType,
                inventory,
                supplier,
                from,
                to,
                paymentType, 
                chequeNo,
                chequeDate,
                finalAmt,
                remark
            } = req.body;

            const inventoryRecord = await Inventory.findByPk(inventory, { transaction: t });
            if (!inventoryRecord) {
                res.status(400).json(new ApiResponse(400, "Inventory not found", "Please try again", false))
            }

            let currentPV = inventoryRecord.paymentVoucherDocNo; 
            let pvNumber = parseInt(currentPV.split("-")[1]) + 1; 
            inventoryRecord.paymentVoucherDocNo = `PV-${pvNumber.toString().padStart(3, "0")}`; 
            console.log(inventoryRecord.paymentVoucherDocNober)
            let amount = finalAmt;
            if(amount>0){
                amount = -amount; 
            }
            const newTransaction = await AccountsTransaction.create({
                transactionType,
                inventory,
                supplier,
                documentNumber:  currentPV,
                from,
                to,
                paymentType,
                chequeNo,
                chequeDate,
                finalAmt: amount,
                remark,
                actionBy: req.user.firstName
            }, { transaction: t });
            console.log("Done create")
            if (paymentType === "Cash") {
                inventoryRecord.cashAmount -= finalAmt;
            } else if (paymentType === "Online"|| paymentType === "Cheque") {
                inventoryRecord.bankAmount -= finalAmt;
            } else if (paymentType === "Other") {
                inventoryRecord.otherAmount -= finalAmt;
            }

            await inventoryRecord.save({ transaction: t });
        
            await t.commit();
            return res.status(201).json(new ApiResponse(201, newTransaction, "Payment Record Added", true));

        } else if(transactionType == 'receipt'){
            const sequelize = initialSequelize();
            const t = await (await sequelize).transaction();
                const {
                    transactionType,
                    inventory,
                    supplier,
                    from,
                    to,
                    paymentType, // Determines where to add finalAmt
                    chequeNo,
                    chequeDate,
                    finalAmt,
                    remark
                } = req.body;
        
                const inventoryRecord = await Inventory.findByPk(inventory, { transaction: t });
        
                if (!inventoryRecord) {
                    res.status(400).json(new ApiResponse(400, "Inventory not found", "Please try again", false))
                }

                        // Increment receiptVoucherDocNo (from RV-001 to RV-002)
                let currentRV = inventoryRecord.receiptVoucherDocNo; // Example: "RV-001"
                let rvNumber = parseInt(currentRV.split("-")[1]) + 1; // Extract the number and increment
                inventoryRecord.receiptVoucherDocNo = `RV-${rvNumber.toString().padStart(3, "0")}`; // Format back to RV-002
        
                // Create the account transaction ONLY IF inventory exists
                const newTransaction = await AccountsTransaction.create({
                    transactionType,
                    inventory,
                    supplier,
                    documentNumber:  currentRV,
                    from,
                    to,
                    paymentType,
                    chequeNo,
                    chequeDate,
                    finalAmt,
                    remark,
                    actionBy: req.user.firstName
                }, { transaction: t });
        
                // Update the relevant amount field based on paymentType
                if (paymentType === "Cash") {
                    inventoryRecord.cashAmount += finalAmt;
                } else if (paymentType === "Online"|| paymentType === "Cheque") {
                    inventoryRecord.bankAmount += finalAmt;
                } else if (paymentType === "Other") {
                    inventoryRecord.otherAmount += finalAmt;
                }
        
                // Save inventory changes
                await inventoryRecord.save({ transaction: t });
        
                // Commit the transaction
                await t.commit();
                return res.status(201).json(new ApiResponse(201, newTransaction, "Receipt Record Added", true));
        }
    }

    catch(error){
        console.log(error)
        return res.status(500).json(new ApiResponse(500, {}, "Failed to create transaction", false));
        
    }
}

const editAccountTransaction = async (req, res) => {
    try {
        const { transactionID } = req.params; // ID of the transaction to update
        const { transactionType } = req.body;

        if (!transactionID) {
            return res.status(400).json(new ApiResponse(400, {}, "Transaction ID is required", false));
        }

        const sequelize = initialSequelize();
        const t = await (await sequelize).transaction();

        try {
            // Find the existing transaction
            const existingTransaction = await AccountsTransaction.findByPk(transactionID, { transaction: t });

            if (!existingTransaction) {
                return res.status(404).json(new ApiResponse(404, {}, "Transaction not found", false));
            }

            const { inventory, supplier, challanNumber, challanDate, billNumber, billDate, transactionDetail, finalAmt, remark, actionBy } = req.body;

            if (transactionType === "purchase") {
                // Update Account Transaction
                existingTransaction.set({
                    supplier,
                    challanNumber,
                    challanDate,
                    billNumber,
                    billDate,
                    finalAmt,
                    remark,
                    actionBy: req.user.firstName
                });
                await existingTransaction.save({ transaction: t });

                const accountTransactionOld = await AccountsTransactionDetails.findAll({ 
                    where: { accountTransaction: transactionID }, 
                    transaction: t 
                })

                // Remove existing transaction details
                await AccountsTransactionDetails.destroy({
                    where: { accountTransaction: transactionID },
                    transaction: t
                });
      
                // Restore inventory before updating
                for (const oldDetail of accountTransactionOld) {
                    const inventoryDetail = await InventoryDetails.findOne({
                        where: { inventoryID: inventory, productID: oldDetail.productID },
                        transaction: t
                    });

                    if (inventoryDetail) {
                        inventoryDetail.quantity -= oldDetail.quantity;
                        await inventoryDetail.save({ transaction: t });
                    }
                }

                // Insert updated transaction details
                for (const detail of transactionDetail) {
                    const { productID, quantity, discountAmt, amount, wholeSalePrice, cgstAmount, sgstAmount, igstAmount, netAmount } = detail;
                    
                    await AccountsTransactionDetails.create({
                        accountTransaction: transactionID,
                        productID,
                        quantity,
                        discountAmt,
                        amount,
                        wholeSalePrice,
                        cgstAmount,
                        sgstAmount,
                        igstAmount,
                        netAmount
                    }, { transaction: t });

                    // Update inventory quantity
                    let inventoryDetail = await InventoryDetails.findOne({
                        where: { inventoryID: inventory, productID },
                        transaction: t
                    });

                    if (inventoryDetail) {
                        inventoryDetail.quantity += quantity;
                        await inventoryDetail.save({ transaction: t });
                    } else {
                        await InventoryDetails.create({
                            inventoryID: inventory,
                            productID,
                            quantity
                        }, { transaction: t });
                    }
                }
            } else if (transactionType === "payment" || transactionType === "receipt") {
                const { paymentType, chequeNo, chequeDate } = req.body;
                const oldAmount = existingTransaction.finalAmt;
                const oldPaymentType = existingTransaction.paymentType;
                // Update Account Transaction
                existingTransaction.set({
                    actionBy,
                    paymentType,
                    chequeNo,
                    chequeDate,
                    finalAmt,
                    remark
                });
                await existingTransaction.save({ transaction: t });

                // Update inventory amount based on payment type
                const inventoryRecord = await Inventory.findByPk(inventory, { transaction: t });

                if (!inventoryRecord) {
                    return res.status(400).json(new ApiResponse(400, "Inventory not found", "Please try again", false));
                }

                if (transactionType === "payment") {
                    let amount = finalAmt;
                    if(finalAmt > 0){
                        amount = -finalAmt;
                    }
                    let oldAmt = oldAmount;
                    if(oldAmt < 0){
                        oldAmt = - oldAmt;
                    }
                    if (oldPaymentType === "Cash") {
                        inventoryRecord.cashAmount += oldAmt;
                    } else if (oldPaymentType === "Online" || oldPaymentType === "Cheque") {
                        inventoryRecord.bankAmount += oldAmt;
                    } else if (oldPaymentType === "Other") {
                        inventoryRecord.otherAmount += oldAmt;
                    }
                    if (paymentType === "Cash") {
                        inventoryRecord.cashAmount += amount;
                    } else if (paymentType === "Online" || paymentType === "Cheque") {
                        inventoryRecord.bankAmount += amount;
                    } else if (paymentType === "Other") {
                        inventoryRecord.otherAmount += amount;
                    }
                } else if (transactionType === "receipt") {
                    let amount = finalAmt;
                    if(finalAmt < 0){
                        amount = -finalAmt;
                    }
                    let oldAmt = oldAmount;
                    if(oldAmt > 0){
                        oldAmt = - oldAmt;
                    }
                    if (oldPaymentType === "Cash") {
                        inventoryRecord.cashAmount += oldAmt;
                    } else if (oldPaymentType === "Online" || oldPaymentType === "Cheque") {
                        inventoryRecord.bankAmount += oldAmt;
                    } else if (oldPaymentType === "Other") {
                        inventoryRecord.otherAmount += oldAmt;
                    }
                    if (paymentType === "Cash") {
                        inventoryRecord.cashAmount += amount;
                    } else if (paymentType === "Online" || paymentType === "Cheque") {
                        inventoryRecord.bankAmount += amount;
                    } else if (paymentType === "Other") {
                        inventoryRecord.otherAmount += amount;
                    }
                }

                await inventoryRecord.save({ transaction: t });
            }

            await t.commit();
            return res.status(200).json(new ApiResponse(200, existingTransaction, "Transaction updated successfully", true));
        } catch (error) {
            await t.rollback();
            console.error("Error in editAccountTransaction:", error);
            return res.status(500).json(new ApiResponse(500, {}, "Failed to update transaction", false));
        }
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, {}, "Failed to update transaction", false));
    }
};


const deleteAccountTransaction = async (req, res) => {
    try {
        const { transactionID } = req.params;

        if (!transactionID) {
            return res.status(400).json(new ApiResponse(400, {}, "Transaction ID is required", false));
        }

        const sequelize = initialSequelize();
        const t = await (await sequelize).transaction();

        try {
            // Find the existing transaction
            const existingTransaction = await AccountsTransaction.findByPk(transactionID, { transaction: t });

            if (!existingTransaction) {
                return res.status(404).json(new ApiResponse(404, {}, "Transaction not found", false));
            }

            const { transactionType, inventory, finalAmt, paymentType } = existingTransaction;

            if (transactionType === "purchase") {
                // Find all transaction details
                const transactionDetails = await AccountsTransactionDetails.findAll({
                    where: { accountTransaction: transactionID },
                    transaction: t
                });

                // Restore inventory before deleting transaction details
                for (const detail of transactionDetails) {
                    const inventoryDetail = await InventoryDetails.findOne({
                        where: { inventoryID: inventory, productID: detail.productID },
                        transaction: t
                    });

                    if (inventoryDetail) {
                        inventoryDetail.quantity -= detail.quantity; // Revert stock addition
                        await inventoryDetail.save({ transaction: t });
                    }
                }

                // Delete transaction details
                await AccountsTransactionDetails.destroy({
                    where: { accountTransaction: transactionID },
                    transaction: t
                });

            } else if (transactionType === "payment" || transactionType === "receipt") {
                // Update inventory amounts
                const inventoryRecord = await Inventory.findByPk(inventory, { transaction: t });

                if (!inventoryRecord) {
                    return res.status(400).json(new ApiResponse(400, "Inventory not found", "Please try again", false));
                }
                let amount = finalAmt;
                    if(finalAmt < 0){
                        amount = -finalAmt;
                    }
                if (transactionType === "payment") {
                    if (paymentType === "Cash") {
                        inventoryRecord.cashAmount += amount;
                    } else if (paymentType === "Online" || paymentType === "Cheque") {
                        inventoryRecord.bankAmount += amount;
                    } else if (paymentType === "Other") {
                        inventoryRecord.otherAmount += amount;
                    }
                } else if (transactionType === "receipt") {
                    if (paymentType === "Cash") {
                        inventoryRecord.cashAmount -= finalAmt;
                    } else if (paymentType === "Online" || paymentType === "Cheque") {
                        inventoryRecord.bankAmount -= finalAmt;
                    } else if (paymentType === "Other") {
                        inventoryRecord.otherAmount -= finalAmt;
                    }
                }

                await inventoryRecord.save({ transaction: t });
            }

            // Delete the transaction
            await AccountsTransaction.destroy({
                where: { transactionID },
                transaction: t
            });

            await t.commit();
            return res.status(200).json(new ApiResponse(200, {}, "Transaction deleted successfully", true));

        } catch (error) {
            await t.rollback();
            console.error("Error in deleteAccountTransaction:", error);
            return res.status(500).json(new ApiResponse(500, {}, "Failed to delete transaction", false));
        }
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, {}, "Failed to delete transaction", false));
    }
};

const getAccountTransactionById = async (req, res) => {
    try {
        const transactionID = req.params.transactionID;

        // Fetch the transaction
        const transaction = await AccountsTransaction.findByPk(transactionID);

        if (!transaction) {
            return res.status(404).json(new ApiResponse(404, {}, "Transaction not found", false));
        }

        // Fetch transaction details with product name
        const transactionDetail = await AccountsTransactionDetails.findAll({
            where: { accountTransaction: transactionID },
            include: [
                {
                    model: product,  // Ensure this model is associated correctly
                    attributes: ['productID', 'productName']
                }
            ]
        });
        console.log(transactionDetail[0].MasterProduct.productName)

        // Transform the response to include productName properly
        const transactionDetailWithProductName = transactionDetail.map(detail => ({
            transactionDetailID: detail.transactionDetailID,
            accountTransaction: detail.accountTransaction,
            productID: detail.productID,
            productName: detail.MasterProduct ? detail.MasterProduct.productName : null, // Handle null cases
            quantity: detail.quantity,
            discountAmt: detail.discountAmt,
            wholeSalePrice: detail.wholeSalePrice,
            netAmount: detail.netAmount,
            sgstAmount: detail.sgstAmount,
            cgstAmount: detail.cgstAmount
        }));

        const transactionWithDetails = {
            ...transaction.toJSON(), // Convert Sequelize instance to plain object
            transactionDetail: transactionDetailWithProductName
        };

        return res.status(200).json(new ApiResponse(200, transactionWithDetails, "Transaction retrieved successfully", true));

    } catch (error) {
        console.error("Error fetching transaction:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Failed to retrieve transaction", false));
    }
};

const getAllTransactions = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10,
            search,
            paymentType, 
            transactionType,
            supplierID, 
            inventory,  // ✅ Now supports array
            supplierName, 
            dateFrom, 
            dateTo, 
            fromDate, // New parameter
            toDate,   // New parameter
            dateField = 'createdAt',
            pagination
        } = req.query;

        const offset = (page - 1) * limit;  // Calculate pagination offset
        const whereClause = {};  // Initialize filters
        const transactionTypeArr = JSON.parse(transactionType);
        const paymentTypeArr = JSON.parse(paymentType);
        const supplierArr = JSON.parse(supplierID);
        const inventoryArr = JSON.parse(inventory);

        // Apply filters dynamically
        if (transactionTypeArr.length > 0) {
            whereClause.transactionType = { [Op.in]: transactionTypeArr };
        }
        if (paymentTypeArr.length > 0) {
            whereClause.paymentType = { [Op.in]: paymentTypeArr };
        }
        if (supplierArr.length > 0) {
            whereClause.supplier = { [Op.in]: supplierArr };
        }
        if (inventoryArr.length > 0) {
            whereClause.inventory = { [Op.in]: inventoryArr };
        }

        if (inventoryArr.length <= 0) {
            whereClause.inventory = { [Op.in]: 0 };
        }

        // Date Range Filter - Adjust according to the new conditions
        let startDate = fromDate || dateFrom;
        let endDate = toDate || dateTo || new Date();  // If toDate is not provided, use current date

        // Check if the start and end dates are the same, include that date
        if (startDate && endDate) {
            // Convert to UTC to ensure consistency between frontend and backend
            startDate = moment(startDate).tz('Asia/Kolkata', true).startOf('day').toDate();
            endDate = moment(endDate).tz('Asia/Kolkata', true).endOf('day').toDate();

            if (new Date(startDate).getTime() === new Date(endDate).getTime()) {
                whereClause[dateField] = { [Op.gte]: new Date(startDate) };
            } else {
                whereClause[dateField] = {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                };
            }
        }

        // Search by Supplier Name - Requires Joining with Supplier Table
        let supplierFilter = {};
        if (search) {
            whereClause.documentNumber = { [Op.like]: `%${documentNumber}%` };
        }

        // Fetch Transactions with Filters & Optional Pagination
        if(pagination == "true"){
            const { count, rows } = await AccountsTransaction.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Account,  
                        as: "Supplier",  
                        attributes: ["accountName"], 
                        where: supplierName ? supplierFilter : undefined, 
                    },
                    {
                        model: Inventory, // ✅ Join Inventory to get inventory name
                        as: "Inventory",
                        attributes: ["inventoryName"], // ✅ Fetch only inventory name
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [["createdAt", "DESC"]],
            });
    
            return res
                .status(200)
                .json(new ApiResponse(200, 
                  { 
                    pagination: {
                        totalRecords: count,
                        currentPage: page,
                        totalPages: Math.ceil(count / limit),
                    },
                    data: rows
                  }, "Account Transaction fetched", true));
        } else {
            const { count, rows } = await AccountsTransaction.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Account,  
                        as: "Supplier",  
                        attributes: ["accountName"], 
                        where: supplierName ? supplierFilter : undefined, 
                    },
                    {
                        model: Inventory, // ✅ Join Inventory to get inventory name
                        as: "Inventory",
                        attributes: ["inventoryName"], // ✅ Fetch only inventory name
                    }
                ],
                order: [["createdAt", "DESC"]],
            });
    
            return res
                .status(200)
                .json(new ApiResponse(200, 
                    
                    rows
                  , "Account Transaction fetched", true));
        }
        
    
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Failed to fetch transactions", error });
    }
};

const getAggregatedProductQuantity = async (req, res) => {
    try {
        const { supplierID, inventoryIDs } = req.query;

        if (!supplierID || !inventoryIDs) {
            return res.status(400).json(new ApiResponse(400, {}, "supplierID and inventoryIDs are required", false));
        }

        // ✅ Fix: Ensure `inventoryIDs` is properly parsed
        let inventoryArray;
        try {
            let cleanedInventoryIDs = decodeURIComponent(inventoryIDs); // Removes %22 (extra quotes)
            inventoryArray = JSON.parse(cleanedInventoryIDs);

            if (!Array.isArray(inventoryArray) || inventoryArray.length === 0) {
                throw new Error("Invalid inventoryIDs format");
            }
        } catch (error) {
            return res.status(400).json(new ApiResponse(400, {}, "Invalid inventoryIDs format", false));
        }

        const result = await AccountsTransactionDetails.findAll({
            attributes: [
                "productID",
                [Sequelize.fn("SUM", Sequelize.col("quantity")), "totalQuantity"]
            ],
            include: [
                {
                    model: AccountsTransaction,
                    where: {
                        supplier: supplierID,
                        inventory: { [Op.in]: inventoryArray }
                    },
                    attributes: ["transactionDocumentNumber", "inventory"], // ✅ Include inventory ID
                    include: [
                        {
                            model: Inventory,
                            as: "Inventory", // Ensure alias matches model association
                            attributes: ["inventoryName"] // ✅ Fetch inventory name
                        }
                    ]
                },
                {
                    model: product,
                    attributes: ["productName"] // ✅ Fetch product name
                }
            ],
            group: ["productID", "masterproduct.productID"],
            order: [[Sequelize.fn("SUM", Sequelize.col("quantity")), "DESC"]] // ✅ Sort by highest quantity
        });

        return res.status(200).json(new ApiResponse(200, result, "Aggregated product quantities retrieved", true));

    } catch (error) {
        console.error("Error fetching aggregated quantities:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Failed to fetch aggregated product quantities", false));
    }
};

export { createAccountTransaction, editAccountTransaction, deleteAccountTransaction, getAccountTransactionById, getAllTransactions, getAggregatedProductQuantity }
