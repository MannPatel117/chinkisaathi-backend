import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshInventoryAccountBalance, getInventoryAccountBalance, generateLedger } from "../controllers/inventoryAccountBalance.controller.js";

const router = Router()

router.route("/accountBalance").get(verifyJWT, getInventoryAccountBalance);
router.route("/refresh").get(verifyJWT, refreshInventoryAccountBalance)
router.route("/ledger").get(verifyJWT, generateLedger)

export default router