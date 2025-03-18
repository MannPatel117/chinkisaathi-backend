import { Router } from "express";
import { verifyJWT, verifyRoleSA } from "../middlewares/auth.middleware.js";
import { createInventory, getInventoryById, updateInventory, deleteInventory, getAllInventories, getAllInventoryIDs } from "../controllers/inventory.controller.js";
import serverless from "serverless-http";
const router = Router()

router.route('/inventory').post(verifyJWT, verifyRoleSA, createInventory);
router.route('/inventory/:id?').get(verifyJWT, getInventoryById);
router.route('/inventory/:id?').patch(verifyJWT, updateInventory);
router.route('/inventory/:id?').delete(verifyJWT, deleteInventory);
router.route('/').get(verifyJWT, getAllInventories);
router.route('/ids').get(verifyJWT, getAllInventoryIDs);

export default serverless(app);