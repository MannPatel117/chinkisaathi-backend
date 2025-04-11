import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createProduct, getProduct, updateProduct, deleteProduct, allProduct, productStats, bulkproduct } from "../controllers/product.controller.js";

const router = Router()

router.route("/product").post(verifyJWT, createProduct)
router.route("/product/:id").get(verifyJWT, getProduct)
router.route('/product/:id').patch(verifyJWT, updateProduct)
router.route('/product/:id').delete(verifyJWT, deleteProduct)
router.route("/").get(verifyJWT, allProduct)
router.route("/stats").get(verifyJWT, productStats)
router.route("/bulkprod").get(verifyJWT, bulkproduct)

export default router