import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createUser, getUserById, updateUser, deleteUser, getAllUsers, usersStats } from "../controllers/users.controller.js";

const router = Router()

router.route('/user').post(verifyJWT, createUser);
router.route('/user/:phoneNumber?').get(verifyJWT, getUserById);
router.route('/user/:phoneNumber?').put(verifyJWT, updateUser);
router.route('/user/:phoneNumber?').delete(verifyJWT, deleteUser);
router.route('/').get(verifyJWT, getAllUsers);
router.route("/stats").get(verifyJWT, usersStats)

export default router