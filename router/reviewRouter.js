import express from "express";
import { createReview, deleteReview, getReview, getReviewById, getReviewByProduct, updateReview } from "../controllers/reviewController.js";
import authorizeUser from "../lib/jwtMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/" , authorizeUser , createReview)
reviewRouter.get("/" , getReview)
reviewRouter.get("/product/:productId", getReviewByProduct)
reviewRouter.delete("/:reviewId" , authorizeUser , deleteReview)
reviewRouter.put("/:reviewId" , authorizeUser , updateReview)
reviewRouter.get("/:reviewId" , getReviewById)

export default reviewRouter;