import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createBill, editBill, getBillById, getAllBills, getTotalSalesForPreviousDay } from "../controllers/bill.controller.js";

const router = Router()

router.route('/bill').post(verifyJWT, createBill);
router.route('/bill/:billID?').put(verifyJWT, editBill);
router.route('/').get(verifyJWT, getAllBills);
router.route('/bill/:billID?').get(verifyJWT, getBillById);
router.route('/previousStats').get(verifyJWT, getTotalSalesForPreviousDay);

export default router