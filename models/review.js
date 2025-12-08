import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        reviewId : {
            type : String,
            required : true,
            unique : true
        },

        email : {
            type : String,
            required : true
        },

        name : {
            type : String,
            required : true
        },

        image : {
            type : String,
            default : "/images/default-profile.png"
        },

        rating : {
            type : Number,
            required : true,
            min : 1.0,
            max : 5.0
        },

        message : {
            type : String,
            required : true
        },

        isVisible : {
            type : Boolean,
            default : true
        },

        date : {
            type : Date,
            default : Date.now
        }
    }
)

const Review = mongoose.model("Review" , reviewSchema)

export default Review;