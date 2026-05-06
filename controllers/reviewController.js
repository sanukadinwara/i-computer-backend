import Review from "../models/review.js";
import { isAdmin } from "./userController.js";
import User from "../models/user.js";

export async function createReview(req, res) {

    if (req.user == null) {
        return res.status(401).json({
            message: "Please login and try again"
        });
    }

    try {
        const loggedInUser = await User.findOne({ email: req.user.email });

        if (!loggedInUser) {
            console.log("User not found for email:", req.user?.email);
            return res.status(404).json({ message: "User not found" });
        }

        const data = req.body;

        const newReview = new Review({
            reviewId: data.reviewId, 
            productId: data.productId,
            email: loggedInUser.email, 
            name: loggedInUser.firstName + " " + loggedInUser.lastName,
            rating: data.rating,
            message: data.message || data.comment, 
            images: data.images || [],
            profilePicture: loggedInUser.image || "/images/default-profile.png"
        });

        await newReview.save();
        res.status(200).json({ message: "Review added successfully" });

    } catch (error) {
        console.log("Review Error details", error);
        res.status(500).json({
            message: "Error adding review", error: error
        });
    }
}

export async function getReview(req , res) {

    try{

    const reviews = await Review.find();
    res.status(200).json(reviews);

    }catch(error){

        res.status(500).json({
            message : "Error fetching reviews" , error : error
        })
    }
    
}

export async function deleteReview(req, res) {
    try {
        const reviewId = req.params.reviewId;
        const review = await Review.findOne({ reviewId: reviewId });

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (isAdmin(req) || req.user.email === review.email) {
            await Review.deleteOne({ reviewId: reviewId });
            return res.status(200).json({ message: "Review deleted successfully" });
        } else {
            return res.status(403).json({ message: "Access denied. Unauthorized to delete this review" });
        }

    } catch (error) {
        res.status(500).json({ message: "Error deleting review", error: error });
    }
}

export async function updateReview(req , res) {

    if(req.user == null){
        res.status(401).json({
            message : "Please login and try again"
        })
    }

    try{

        const reviewId = req.params.reviewId;

        const data = req.body;



        const result = await Review.findOneAndUpdate({reviewId : reviewId} , data , {new : true});

        if(result == null){
            res.status(404).json({
                message : "Review not found"
            });

        }else{
            res.status(200).json({
                message : "Review updated successfully"
            });
        }    

    }catch(error){

        console.log("Review Error details" , error);

        res.status(500).json({
            message : "Error updating review" , error : error
        })
    }
    
}

export async function getReviewById(req, res) {

    try{

        const reviewId = req.params.reviewId;
        const review = await Review.findOne({reviewId : reviewId});

        if(reviewId == null){
            res.status(404).json({
                message : "Review not found"
            })
            return;
        }

        if(!review.isVisible){
            if(!isAdmin(req)){
                res.status(404).json({
                    message : "Review not found"
                })
                return;
            }
        }

        res.status(200).json(review);

    }catch(error){
        res.status(403).json({
            message : "Error fetching review" , error : error
        })
    }

}

export async function getReviewByProduct(req, res) {
    try {
        const productId = req.params.productId;
        const reviews = await Review.find({ productId: productId });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews", error: error });
    }
}