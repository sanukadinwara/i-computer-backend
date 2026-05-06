import express from "express";
import { createProduct, deleteProduct, getProductById, getProducts, searchProducts, updateProduct } from "../controllers/productController.js";
import authorizeUser from "../lib/jwtMiddleware.js"; 

const productRouter = express.Router();

productRouter.post("/" , authorizeUser, createProduct); 

productRouter.get("/" , getProducts);

productRouter.get("/search/:query" , searchProducts);

productRouter.delete("/:productId" , authorizeUser, deleteProduct); 
productRouter.put("/:productId" , authorizeUser, updateProduct);

productRouter.get("/:productId" , getProductById);

export default productRouter;