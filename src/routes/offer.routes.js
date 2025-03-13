import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createOffer, getOffer, editOffer, deleteOffer, getOffers, offerStats, generateCoupons, getCouponsByOfferId, getCouponsByCouponId } from "../controllers/offers.controller.js";

const router = Router()
router.route('/offer').post(verifyJWT, createOffer);
router.route('/offer/:offerID?').get(verifyJWT, getOffer);
router.route('/offer/:offerID?').patch(verifyJWT, editOffer);
router.route('/offer/:offerID?').delete(verifyJWT, deleteOffer);
router.route('/').get(verifyJWT, getOffers);
router.route('/stats').get(verifyJWT, offerStats);
router.route('/coupons').post(verifyJWT, generateCoupons);
router.route('/coupons/:offerID?').get(verifyJWT, getCouponsByOfferId);
router.route('/couponRedeem/:offerID?').get(verifyJWT, getCouponsByCouponId);
export default router