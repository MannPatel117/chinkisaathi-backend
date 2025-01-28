import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAccount, getAccount, updateAccount, deleteAccount, getBasicAccountDetails, allAccount, accountStats } from "../controllers/account.controller.js";

const router = Router()

router.route('/account').post(verifyJWT, createAccount);
router.route('/account/:id?').get(verifyJWT, getAccount);
router.route('/account/:id?').put(verifyJWT, updateAccount);
router.route('/account/:id?').delete(verifyJWT, deleteAccount);
router.route('/accounts').get(verifyJWT, getBasicAccountDetails);
router.route('/').get(verifyJWT, allAccount);
router.route("/stats").get(verifyJWT, accountStats)

export default router