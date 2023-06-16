const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
  name:{
    type:String
  },
  category:{
    type:String
  },
  quantity:{
    type: Number
  },
  sub_category:{
    type: String
  },
  color:{
    type:String
  },
  price:{
    type:Number
  },
  size:{
    type:String
  },
  description:{
    type: String
  },
  image:[
    {
      type:String,
      required:true
    }
  ],
  price:{
    type:Number
  },
  status:{
    type:Boolean,
    default:true
  }

})

const Product = mongoose.model("Product",productSchema)

module.exports = Product