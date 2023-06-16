const mongoose=require('mongoose');
const ObjectId=mongoose.Types.ObjectId;

const orderSchema=mongoose.Schema({

    address:{
        type:ObjectId
    },
    orderedItems:[
        {
            prodId: {
                type:ObjectId,
            },
            quantity:{
                type:Number,
            }
        }
    ],
    user:{
        type:ObjectId,
    },
    payment:{
        type:String
    },
    orderDate:Date,
    totalAmount:{
        type:Number
    },
    orderStatus:{
        type:String,
        default:'Pending'
    },
    reason:{
        type:String
    }
})

const Order = mongoose.model("Order",orderSchema)
module.exports= Order