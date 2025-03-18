import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAdmin, loginAdmin, getAdmin, updateAdmin, deleteAdmin, getAdminUsers, verifySession } from "../controllers/adminUser.controller.js";

const router = Router()

router.route('/login').post(loginAdmin)

router.route('/user').post(createAdmin)
router.route('/user/:username').get(verifyJWT, getAdmin)
router.route('/user/:username').patch(verifyJWT, updateAdmin)
router.route('/user/:username').delete(verifyJWT, deleteAdmin)
router.route('').get(verifyJWT, getAdminUsers)
router.route('/session').get(verifySession)

export default router