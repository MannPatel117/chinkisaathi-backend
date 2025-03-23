import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createBill, editBill, getBillById, getAllBills } from "../controllers/bill.controller.js";

const router = Router()

router.route('/bill').post(verifyJWT, createBill);
router.route('/bill/:billID?').put(verifyJWT, editBill);
router.route('/').get(verifyJWT, getAllBills);
router.route('/bill/:billID?').get(verifyJWT, getBillById);

export default router