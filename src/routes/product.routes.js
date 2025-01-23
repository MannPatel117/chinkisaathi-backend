import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createProduct, getProduct, updateProduct, deleteProduct, allProduct, productStats } from "../controllers/product.controller.js";

const router = Router()

router.route("/product").post(verifyJWT, createProduct)
router.route("/product/:barcode").get(verifyJWT, getProduct)
router.route('/product/:barcode').patch(verifyJWT, updateProduct)
router.route('/product/:barcode').delete(verifyJWT, deleteProduct)
router.route("/").get(verifyJWT, allProduct)
router.route("/stats").get(verifyJWT, productStats)

export default router