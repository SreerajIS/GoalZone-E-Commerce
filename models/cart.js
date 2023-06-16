const mongoose = require('mongoose')
const cartSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId
  },
  product:[
    {
      prodId:{
        type:mongoose.Schema.Types.ObjectId
      },
      quantity:{
        type:Number,
        default:1,
        required:true
      }
    }
  ],
  couponCode:
  {
    type:String
  },
  offerCategory:{
    type:String
  }
})


const Cart =  mongoose.model("Cart", cartSchema);

module.exports = Cart;