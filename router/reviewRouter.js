import express from "express";
import { createReview, deleteReview, getReview, getReviewById, updateReview } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/" , createReview)
reviewRouter.get("/" , getReview)
reviewRouter.delete("/:reviewId" , deleteReview)
reviewRouter.put("/:reviewId" , updateReview)
reviewRouter.get("/:reviewId" , getReviewById)

export default reviewRouter;