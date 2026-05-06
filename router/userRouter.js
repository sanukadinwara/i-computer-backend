import express from "express"
import { createUser, loginUser, getUser, changeUserPassword, sendOTP, verifyOTP, googleLogin, getAllUsers, deleteUser, blockUser, unblockUser, updateUserProfile } from "../controllers/userController.js"
import authorizeUser from "../lib/jwtMiddleware.js"

const userRouter = express.Router()

userRouter.post("/",createUser)
userRouter.post("/login" , loginUser)
userRouter.post("/update-password", authorizeUser, changeUserPassword)
userRouter.post("/send-otp", sendOTP)
userRouter.post("/verify-otp", verifyOTP)
userRouter.post("/google-login", googleLogin)
userRouter.get("/profile", authorizeUser, getUser)
userRouter.get("/", getAllUsers)
userRouter.delete("/:id", deleteUser)
userRouter.put("/:id/block", blockUser)
userRouter.put("/:id/unblock", unblockUser)
userRouter.put("/", authorizeUser, updateUserProfile)

export default userRouter

