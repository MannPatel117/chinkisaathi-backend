import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createProduct, getProduct, updateProduct, deleteProduct, allProduct, productStats } from "../controllers/product.controller.js";
import serverless from "serverless-http";
const router = Router()

router.route("/product").post(verifyJWT, createProduct)
router.route("/product/:id").get(verifyJWT, getProduct)
router.route('/product/:id').patch(verifyJWT, updateProduct)
router.route('/product/:id').delete(verifyJWT, deleteProduct)
router.route("/").get(verifyJWT, allProduct)
router.route("/stats").get(verifyJWT, productStats)

export default serverless(app);