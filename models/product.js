import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        productId : {
            type : String,
            required : true,
            unique : true
        },

        name : {
            type : String,
            required : true
        },

        description : {
            type : String,
            required : true
        },

        altNames : {
            type : [String],
            default : []
        },

        price : {
            type : Number,
            required : true
        },

        labeledPrice: { 
            type: Number, 
            default: 0 
        },

        category : {
            type : String,
            default : "Others"
        },

        image: {
            type: [String], 
            required: false,
            default: []
        },

        isVisible : {
            type : Boolean,
            default : true,
            required : true
        },

        brand : {
            type : String,
            default : "Generic"
        },

        model : {
            type : String,
            default : "Standard"
        },

        qty : {
            type : Number,
            default : 100
        }
    }
)

const Product = mongoose.model("Product" , productSchema)

export default Product;