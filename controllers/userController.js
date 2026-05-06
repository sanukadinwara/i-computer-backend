import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import nodemailer from 'nodemailer'

dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    host : "smtp.gmail.com",
    port : 587,
    secure : false,
    auth : {
        user : "velvetvoid45@gmail.com",
        pass : process.env.GMAIL_APP_PASSWORD
    }
})

export function createUser(req, res) {
	const hashedPassword = bcrypt.hashSync(req.body.password, 10);

	const user = new User({
		email: req.body.email,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		password: hashedPassword,
	});

	user
		.save()
		.then(() => {
			res.status(200).json({ message: "User created successfully" });
		})
		.catch((error) => {
			res.status(401).json({ message: "Error creating user", error: error });
		});
}

export function loginUser(req, res) {
    User.findOne({
        email: req.body.email,
    })
        .then((user) => {
            if (user == null) {
                res.status(401).json({
                    message: "User with given email not found",
                });
            } else {
                const isPasswordValid = bcrypt.compareSync(
                    req.body.password,
                    user.password
                );

                if (isPasswordValid) {

                    if (user.isBlocked && user.blockedUntil && new Date() < new Date(user.blockedUntil)) {
                        return res.status(403).json({
                            message: "User is blocked",
                            blockedUntil: user.blockedUntil
                        });
                    }

                    const token = jwt.sign(
                        {
                            id: user._id,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            role: user.role,
                            image: user.image,
                            isEmailVerified: user.isEmailVerified
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: req.body.rememberme ? "30d" : "48h" }
                    );

                    console.log({
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        image: user.image,
                        isEmailVerified: user.isEmailVerified
                    });

                    res.status(200).json({
                        message: "Login successfull",
                        token: token,
                        role: user.role, 
                        user: user
                    });
                } else {
                    res.status(403).json({
                        message: "Login failed",
                    });
                }
            }
        })
        .catch(() => {
            res.status(500).json({
                message: "Internal server error",
            });
        });
}

export function getUser(req, res) {
    const user = req.user;

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        image: user.image,
        isEmailVerified: user.isEmailVerified,
        isBlocked: user.isBlocked 
    });
}

export async function updateUserProfile(req,res){

    if(req.user == null){
        res.status(401).json({
            message: "Unauthorized"
        })
        return
    }
    try{
        await User.updateOne({ email : req.user.email }, { firstName : req.body.firstName, lastName : req.body.lastName, image : req.body.image })
        const user = await User.findOne({ email : req.user.email })
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                image: user.image,
                isEmailVerified: user.isEmailVerified,
            },
            process.env.JWT_SECRET,
            { expiresIn: req.body.rememberme ? "30d" : "48h" }
        );

        res.json({ message : "Profile updated successfully", token : token })
    }catch(error){
        res.status(500).json({ message : "Error updating profile", error : error })
    }
}

export async function changeUserPassword(req,res){

    if(req.user == null){
        res.status(401).json({
            message: "Unauthorized"
        })
        return
    }

    try{

        const hashedPassword = bcrypt.hashSync(req.body.password, 10);

        await User.updateOne({ email : req.user.email }, { password : hashedPassword })
        res.json({ message : "Password changed successfully" })

    }catch(error){
        res.status(500).json({ message: "Error changing password", error : error })
    }
}

export function isAdmin(req){
	if(req.user == null){
		return false
	}

	if(req.user.role == "admin"){
		return true
	}else{
		return false
	}
}

export async function sendOTP(req,res){

    try{

        const user = await User.findOne({ email : req.body.email })
        if(user == null){
            res.status(404).json({ message : "User with given email not found" })
            return
        }

        // Generate and send OTP logic here
        //otp between 10000 and 99999
        const otp = Math.floor(10000 + Math.random() * 90000)

        await OTP.deleteMany({email : req.body.email})

        const newOTP = new OTP({
            email : req.body.email,
            otp : otp
        })

        await newOTP.save()

        const message = {
            from : "velvetvoid45@gmail.com",
            to : req.body.email,
            subject : "Your OTP for password reset",
            text : "Your OTP for password reset is " +otp + ". It is valid for 10 minutes."
        }

        transporter.sendMail(message, (error, info) => {
            if(error){
                console.log("Error sending email", error)
                res.status(500).json({ message : "Error sending OTP", error : error })
            }else{
                console.log("Email sent successfully", info.response)
                res.json({ message : "OTP sent successfully" })
            }
        })

    }catch(error){
        res.status(500).json({ message : "Error sending OTP", error : error })
    }
}

export async function verifyOTP(req,res){

    try{

        const otpCode = req.body.otp
        const email = req.body.email
        const newPassword = req.body.newPassword

        const otpRecord = await OTP.findOne({ email : email})

        if(otpRecord == null){
            res.status(404).json({ message : "OTP not found for the given email" })
            return
        }

        if(otpRecord.otp != otpCode){
            res.status(400).json({ message : "Invalid OTP" })
            return
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await User.updateOne({ email : email }, { password : hashedPassword })
        await OTP.deleteOne({ email : email })
        res.json({ message : "Password reset successfully" })

    }catch(error){
        res.status(500).json({ message : "Error verifying OTP", error : error })
    }
}

export async function googleLogin(req,res){

    try{

        const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{
            headers : {
                Authorization : "Bearer "+req.body.token
            }
        })

        console.log(googleResponse)

        const user = await User.findOne({ email : googleResponse.data.email})

        if(user == null){
            const newUser = new User({
                email : googleResponse.data.email,
                firstName : googleResponse.data.given_name,
                lastName : googleResponse.data.family_name,
                password : "google-login",
                image : googleResponse.data.picture,
                isEmailVerified : true
            })

            await newUser.save()

            const token = jwt.sign(
                {
                    id: newUser._id, 
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role,
                    image: newUser.image,
                    isEmailVerified: newUser.isEmailVerified,
                },
                process.env.JWT_SECRET,
                { expiresIn: req.body.rememberme ? "30d" : "48h" }
            );

            return res.json({
                message: "Login successful",
                token: token,
                role: newUser.role,
            })
        } else {
            const token = jwt.sign(
                {
                    id: user._id, 
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    image: user.image,
                    isEmailVerified: user.isEmailVerified,
                },
                process.env.JWT_SECRET,
                { expiresIn: req.body.rememberme ? "30d" : "48h" }
            );

            return res.json({
                message: "Login successful",
                token: token,
                role: user.role,
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error logging in with Google", error: error })
    }
}

export async function getAllUsers(req, res) {
    try {
        const now = new Date();

        await User.updateMany(
            { isBlocked: true, blockedUntil: { $lt: now } },
            { $set: { isBlocked: false, blockedUntil: null } }
        );

        const users = await User.find().select("-password"); 
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error });
    }
}

export async function deleteUser(req, res) {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error });
    }
}

export async function blockUser(req, res) {
    try {
        const durationInDays = req.body.durationInDays || 7;
        
        let blockedUntilDate = new Date(); 
        
        if (durationInDays === 9999) {
            blockedUntilDate.setFullYear(blockedUntilDate.getFullYear() + 100); 
        } else {
            blockedUntilDate.setDate(blockedUntilDate.getDate() + durationInDays); 
        }

        await User.findByIdAndUpdate(req.params.id, { 
            isBlocked: true, 
            blockedUntil: blockedUntilDate 
        });

        res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error blocking user", error: error });
    }
}

export async function unblockUser(req, res) {
    try {
        await User.findByIdAndUpdate(req.params.id, { isBlocked: false, blockedUntil: null });
        res.status(200).json({ message: "User unblocked successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error unblocking user", error: error });
    }
}