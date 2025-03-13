import { ApiResponse } from "../utils/ApiResponse.js";
import { Account } from "../model/account.model.js";
import { Op } from "sequelize";
import { InventoryAccountBalance } from '../model/inventoryAccountBalance.model.js';
import { Inventory } from '../model/inventory.model.js';
import { AccountsTransaction } from "../model/accountTransaction.model.js";
import PdfPrinter from "pdfmake";

const refreshInventoryAccountBalance = async (req, res) => {
    try {
        // Step 1: Fetch all existing inventory and account pairs
        const inventories = await Inventory.findAll({ attributes: ['inventoryID'] });
        const accounts = await Account.findAll({ attributes: ['supplierID'] });

        // Step 2: Loop through all inventory-account combinations and check for missing balances
        const balancePromises = [];
        for (const inventory of inventories) {
            for (const account of accounts) {
                const existingBalance = await InventoryAccountBalance.findOne({
                    where: {
                        inventoryID: inventory.inventoryID,
                        accountID: account.supplierID
                    }
                });

                // If no existing balance, create a new one
                if (!existingBalance) {
                    balancePromises.push(
                        InventoryAccountBalance.create({
                            inventoryID: inventory.inventoryID,
                            accountID: account.supplierID,
                            openingBalance: 0,
                            closingBalance: 0
                        })
                    );
                }
            }
        }

        // Execute all balance creation operations
        await Promise.all(balancePromises);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Inventory-Account Balances refreshed successfully", true));

    } catch (error) {
        console.error("Error refreshing Inventory-Account balances:", error);
        return res
            .status(500)
            .json(new ApiResponse(500, "Could not refresh balances, please try again", "Action Failed", false));
    }
};

const getInventoryAccountBalance = async (req, res) => {
    try {
        // Extract inventoryID and accountID from request params
        const { inventoryID, accountID } = req.query;

        // Validate inputs
        if (!inventoryID || !accountID) {
            return res.status(400).json(
                new ApiResponse(400, "inventoryID and accountID are required", "Invalid Request", false)
            );
        }

        // Fetch the balance for the given inventory and account
        const balance = await InventoryAccountBalance.findOne({
            where: {
                inventoryID: inventoryID,
                accountID: accountID
            }
        });

        // If balance not found, return 404
        if (!balance) {
            return res.status(404).json(
                new ApiResponse(404, "No balance found for the given inventory and account", "Not Found", false)
            );
        }

        // Return the balance data
        return res.status(200).json(new ApiResponse(200, balance, "Balance fetched successfully", true));

    } catch (error) {
        console.error("Error fetching inventory-account balance:", error);
        return res.status(500).json(
            new ApiResponse(500, "Could not retrieve balance, please try again later", "Action Failed", false)
        );
    }
};

const generateLedger = async (req, res) => {
    try {
        const { supplierID, inventoryID, fromDate, toDate } = req.query;

        // Default toDate as today if not provided
        const toDateFinal = toDate && !isNaN(new Date(toDate).getTime()) ? new Date(toDate) : new Date();

        // Fetch Account Details
        const account = await Account.findOne({ where: { supplierID } });
        if (!account) return res.status(404).json({ message: "Supplier not found" });

        // Fetch Inventory Details
        const inventory = await Inventory.findOne({ where: { inventoryID } });
        if (!inventory) return res.status(404).json({ message: "Inventory not found" });

        // Fetch Opening Balance (Credit & Debit) from InventoryAccountBalance
        const balanceData = await InventoryAccountBalance.findOne({ where: { accountID: supplierID, inventoryID } });

        let openingBalanceCredit = balanceData ? balanceData.openingBalanceCredit || 0 : 0;
        let openingBalanceDebit = balanceData ? balanceData.closingBalance || 0 : 0; // Actually openingBalanceDebit

        // Ensure only one has a value (either Credit or Debit)
        let systemOpeningBalance = openingBalanceCredit > 0 ? openingBalanceCredit : -openingBalanceDebit;

        // Calculate Opening Balance (Transactions before fromDate)
        const previousTransactions = await AccountsTransaction.findAll({
            where: {
                supplier: supplierID,
                inventory: inventoryID,
                createdAt: { [Op.lt]: fromDate }, // Transactions before fromDate
            },
        });

        let computedOpeningBalance = systemOpeningBalance;
        previousTransactions.forEach((tx) => {
            if (["payment", "sales"].includes(tx.transactionType.toLowerCase())) {
                computedOpeningBalance -= tx.finalAmt;
            } else if (["receipt", "purchase"].includes(tx.transactionType.toLowerCase())) {
                computedOpeningBalance += tx.finalAmt;
            }
        });

        // Initialize total debit and credit
        let totalDebit = 0;
        let totalCredit = 0;

        // Opening Balance Entry
        let ledgerEntries = [
            {
                date: fromDate,
                particulars: "Opening Balance",
                documentNo: "-",
                debit: computedOpeningBalance < 0 ? Math.abs(computedOpeningBalance) : 0,
                credit: computedOpeningBalance > 0 ? computedOpeningBalance : 0,
            },
        ];

        // Update total debit and credit for opening balance
        if (computedOpeningBalance < 0) {
            totalDebit += Math.abs(computedOpeningBalance);
        } else {
            totalCredit += computedOpeningBalance;
        }

        // Fetch Transactions in the Given Date Range (fromDate to toDateFinal)
        const transactions = await AccountsTransaction.findAll({
            where: {
                supplier: supplierID,
                inventory: inventoryID,
                createdAt: { [Op.between]: [fromDate, toDateFinal] },
            },
            order: [["createdAt", "ASC"]],
        });

        // Process Transactions
        transactions.forEach((tx) => {
            let debitAmount = ["payment", "sales"].includes(tx.transactionType.toLowerCase()) ? tx.finalAmt : 0;
            let creditAmount = ["receipt", "purchase"].includes(tx.transactionType.toLowerCase()) ? tx.finalAmt : 0;

            ledgerEntries.push({
                date: tx.createdAt,
                particulars: tx.transactionType.charAt(0).toUpperCase() + tx.transactionType.slice(1), // Capitalizing first letter
                documentNo: tx.documentNumber,
                remark: tx.remark,
                debit: Math.abs(debitAmount), // Ensuring debitAmount is positive
                credit: creditAmount,
            });

            // Update total debit and credit
            totalDebit += debitAmount;
            totalCredit += creditAmount;
        });

        // Compute Final Balance
        let finalBalance = totalCredit - totalDebit;
        let balanceType = finalBalance < 0 ? "Debit" : "Credit";

       
        const data = {
            supplier: {
                name: account.accountName,
                gst: account.gstNumber,
                phoneNumber: account.phone_Number,
                fromDate: fromDate,
                toDate: toDateFinal
            },
            inventory: {
                name: inventory.inventoryName,
                address:{
                    "addressLine1": inventory.addressLine1,
                    "addressLine2": inventory.addressLine2,
                    "addressLine3": inventory.addressLine3,
                    "city": inventory.city,
                    "state": inventory.state,
                    "pincode": inventory.pincode,
                },
                phoneNumber: inventory.phoneNumber,
            },
            ledger: ledgerEntries,
            totals: {
                totalDebit,
                totalCredit,
                balance: finalBalance,
                balanceType
            }
        }
        const pdfBuffer = await generateLedgerPDF(data);
        return res.status(200).json(new ApiResponse(200, { ...data, pdf: pdfBuffer.toString("base64") }, "Ledger data fetched successfully", true));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};


import pdfmake from '../../node_modules/pdfmake/build/pdfmake.js'
import vfs from '../../node_modules/pdfmake/build/vfs_fonts.js'
pdfmake.vfs = vfs;


const generateLedgerPDF = async (ledgerData) => {
    return new Promise((resolve, reject) => {
        try {
            console.log("!!!");
            const formattedToDate = new Date(ledgerData.supplier.toDate).toLocaleDateString('en-GB'); // 'en-GB' for YYYY-MM-DD format

            const docDefinition = {
                content: [
                    { text: `${ledgerData.inventory.name}`, style: "header" },
                    { text: `${ledgerData.inventory.address.city}, ${ledgerData.inventory.address.state}, ${ledgerData.inventory.address.pincode}`, style: "subheader" },
                    { text: `Mobile Number: ${ledgerData.inventory.phoneNumber}`, style: "subheader" },
                    { text: '', margin: [0, 10] },

    // Solid Line
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 500, y2: 0, lineWidth: 1, strokeColor: '#000' }] },

    // Another Blank Line
    { text: '', margin: [0, 5] },
                    { text: `From: ${ledgerData.supplier.fromDate}  To: ${formattedToDate}`, style: "subheader" },
                    {
                        columns: [
                            { text: `Supplier: ${ledgerData.supplier.name}`, style: "bold", alignment: "left" },
                            { text: `GST: ${ledgerData.supplier.gst}`, style: "bold", alignment: "right" }
                        ]
                    },
                    { text: "Ledger Report", style: "sectionHeader" },

                    {
                        table: {
                            headerRows: 1,
                            widths: ["10%", "15%", "20%", "20%", "15%", "10%", "10%"],
                            body: [
                                [
                                    { text: "Sr. No.", bold: true },
                                    { text: "Date", bold: true },
                                    { text: "Particular", bold: true },
                                    { text: "Document No", bold: true },
                                    { text: "Remark", bold: true },
                                    { text: "Debit", bold: true },
                                    { text: "Credit", bold: true },
                                ],
                                ...ledgerData.ledger.map((entry, index) => [
                                    index + 1,
                                    entry.date,
                                    entry.particulars,
                                    entry.documentNo || "-",
                                    entry.remark || "-",
                                    entry.debit || "-",
                                    entry.credit || "-",
                                ]),
                                [
                                    { text: "Total", colSpan: 5, alignment: "right", bold: true },
                                    {},
                                    {},
                                    {},
                                    {},
                                    { text: ledgerData.totals.totalDebit.toFixed(2), bold: true },
                                    { text: ledgerData.totals.totalCredit.toFixed(2), bold: true },
                                ],
                                [
                                    { text: "Balance", colSpan: 5, alignment: "right", bold: true },
                                    {},
                                    {},
                                    {},
                                    {},
                                    { text: ledgerData.totals.balanceType === "Debit" ? ledgerData.totals.balance.toFixed(2) : "-", bold: true },
                                    { text: ledgerData.totals.balanceType === "Credit" ? ledgerData.totals.balance.toFixed(2) : "-", bold: true },
                                ],
                            ],
                        },
                    },
                ],
                styles: {
                    header: { fontSize: 18, bold: true, alignment: "center", font: 'Roboto' },
                    subheader: { fontSize: 12, alignment: "center", font: 'Roboto' },
                    sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5], font: 'Roboto', alignment: "center" },
                    bold: { bold: true, font: 'Roboto' },
                },
                fonts: {
                    Roboto: {
                        normal: 'Roboto-Regular.ttf',
                        bold: 'Roboto-Bold.ttf',
                        italics: 'Roboto-Italic.ttf',
                        bolditalics: 'Roboto-BoldItalic.ttf',
                    },
                },
            };

            pdfmake.createPdf(docDefinition).getBuffer((buffer) => {
                const base64Pdf = buffer.toString('base64');
                resolve(base64Pdf);
            });
        } catch (error) {
            reject(error);
        }
    });
};



export { refreshInventoryAccountBalance, getInventoryAccountBalance, generateLedger }