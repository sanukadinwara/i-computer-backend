import express from 'express'
import mongoose from "mongoose"
import userRouter from './router/userRouter.js'
import productRouter from './router/productRouter.js'
import reviewRouter from './router/reviewRouter.js'
import cors from 'cors'
import dotenv from 'dotenv'
import orderRouter from './router/orderRouter.js'

dotenv.config()

const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI).then(
    ()=>{
        console.log("Connected to MongoDB")
    }
).catch(
    ()=>{
        console.log("Error connecting to MongoDB")
    }
)

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/users", userRouter)
app.use("/api/products", productRouter)
app.use("/api/reviews" , reviewRouter)
app.use("/api/orders", orderRouter)

function start(){
    console.log("Server started on port 3000")
}

app.listen(3000, start)