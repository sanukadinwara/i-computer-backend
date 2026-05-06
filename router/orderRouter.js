import express from "express";
import { createOrder, getAllOrders, getMyOrders, updateOrderStatusAndNotes } from "../controllers/orderController.js";
import authorizeUser from "../lib/jwtMiddleware.js";

const orderRouter = express.Router();

orderRouter.post("/", authorizeUser, createOrder)
orderRouter.get("/my-orders/:pageSize/:pageNumber", authorizeUser, getMyOrders) 
orderRouter.get("/:pageSize/:pageNumber", authorizeUser, getAllOrders)
orderRouter.put("/:orderId", authorizeUser, updateOrderStatusAndNotes)

export default orderRouter;