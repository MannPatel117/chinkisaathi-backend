import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createBill } from "../controllers/bill.controller.js";

const router = Router()

router.route('/bill').post(verifyJWT, createBill);
// router.route('/inventory/:id?').get(verifyJWT, getInventoryById);
// router.route('/inventory/:id?').patch(verifyJWT, updateInventory);
// router.route('/inventory/:id?').delete(verifyJWT, deleteInventory);
// router.route('/').get(verifyJWT, getAllInventories);
// router.route('/ids').get(verifyJWT, getAllInventoryIDs);

export default router