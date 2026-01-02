import express from 'express'
import mongoose from "mongoose"
import userRouter from './router/userRouter.js'
import productRouter from './router/productRouter.js'
import authorizeUser from './lib/jwtMiddleware.js'
import reviewRouter from './router/reviewRouter.js'
import cors from 'cors'
import dotenv from 'dotenv'

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

app.use(express.json())

app.use(cors())

app.use(authorizeUser)


app.use("/users", userRouter)

app.use("/products", productRouter)

app.use("/reviews" , reviewRouter)

function start(){
    console.log("Server started on port 3000")
}

app.listen(3000, start)