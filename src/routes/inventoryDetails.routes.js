import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { updateInventoryDetail, getInventoryDetailById,  deleteInventoryDetailById, getAllInventoryDetails,  ensureProductInventoryCombinations } from "../controllers/inventoryDetails.controller.js";

const router = Router()

router.route('/inventoryDetails/:id?').get(verifyJWT, getInventoryDetailById);
router.route('/inventoryDetails/:id?').patch(verifyJWT, updateInventoryDetail);
router.route('/inventoryDetails/:id?').delete(verifyJWT, deleteInventoryDetailById);
router.route('/').get(verifyJWT, getAllInventoryDetails);
router.route('/refresh/:id?').get(verifyJWT, ensureProductInventoryCombinations);

export default router