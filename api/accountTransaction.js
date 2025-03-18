import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAccountTransaction, editAccountTransaction, deleteAccountTransaction, getAccountTransactionById, getAllTransactions, getAggregatedProductQuantity } from "../controllers/accountTransaction.controller.js";
import serverless from "serverless-http";

const router = Router()

router.route('/accountTransaction').post(verifyJWT, createAccountTransaction);
router.route('/accountTransaction/:transactionID?').get(verifyJWT, getAccountTransactionById);
router.route('/accountTransaction/:transactionID?').put(verifyJWT, editAccountTransaction);
router.route('/accountTransaction/:transactionID?').delete(verifyJWT, deleteAccountTransaction);
router.route('/').get(getAllTransactions);
router.route("/products").get(verifyJWT, getAggregatedProductQuantity)

export default serverless(app);