import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { updateInventoryDetail, getInventoryDetailById,  deleteInventoryDetailById, getAllInventoryDetails,  ensureProductInventoryCombinations, inventoryStats, getInventoryTransactions, addReconciliation, getAllInventoryDetailsForInventory } from "../controllers/inventoryDetails.controller.js";

const router = Router()

router.route('/inventoryDetails/:id?').get(verifyJWT, getInventoryDetailById);
router.route('/inventoryDetails/:id?').patch(verifyJWT, updateInventoryDetail);
router.route('/inventoryDetails/:id?').delete(verifyJWT, deleteInventoryDetailById);
router.route('/').get(verifyJWT, getAllInventoryDetails);
router.route('/billing').get(verifyJWT, getAllInventoryDetailsForInventory);
router.route('/stats').get(verifyJWT, inventoryStats);
router.route('/refresh/:id?').get(verifyJWT, ensureProductInventoryCombinations);
router.route('/transaction').get(verifyJWT, getInventoryTransactions);
router.route('/reconciliation').post(verifyJWT, addReconciliation);
export default router