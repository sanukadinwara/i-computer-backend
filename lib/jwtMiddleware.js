import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import User from "../models/user.js";

dotenv.config();

export default async function authorizeUser(req, res, next) {
    const header = req.header("Authorization");

    if (header == null || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authorization header missing or invalid."
        });
    }

        const token = header.replace("Bearer ", "").replace(/['"]+/g, '').trim();

        jwt.verify(token, process.env.JWT_SECRET, async(err, decoded) => {
            if (err) {
                return res.status(401).json({
                    message: "Invalid or expired token. Please login again."
                });
            } 
            
            try {
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            if (user.isBlocked) {
                const now = new Date();

                if (user.blockedUntil && now < user.blockedUntil) {
                    return res.status(403).json({ 
                        message: "User is blocked", 
                        blockedUntil: user.blockedUntil 
                    });
                } else {
                    user.isBlocked = false;
                    user.blockedUntil = null;
                    await user.save();
                }
            }

            req.user = user; 
            next();

        } catch (error) {
            console.error("Middleware Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}