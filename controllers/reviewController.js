import Review from "../models/review.js";
import { isAdmin } from "./userController.js";

export async function createReview(req , res) {

    if(req.user == null){
        res.status(401).json({
            message : "Please login and try again"
        })
    }

    try{

        const data = req.body;

        const newReview = new Review(
            {
                reviewId : req.body.reviewId,
                email : req.body.email,
                name : req.user.firstName + " " + req.user.lastName,
                rating : data.rating,
                message : data.message,
                image : req.user.image || ["/images/default-profile.png"]
            }
        )

        await newReview.save();

        res.status(200).json({
            message : "Review added successfully"
        });

    }catch(error){

        console.log("Review Error details" , error);

        res.status(500).json({
            message : "Error adding review" , error : error
        })
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

export async function deleteReview(req , res) {

    if(!isAdmin(req)){
        res.status(500).json({
            message : "Access denied. Admins only"
        })
    }

    try{

        const reviewId = req.params.reviewId;
        await Review.deleteOne({reviewId : reviewId});
        res.status(200).json({
            message : "Review deleted successfully"
        })

    }catch(error){

        res.status(500).json({
            message : "Error deleting review" , error : error
        })
        return;

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