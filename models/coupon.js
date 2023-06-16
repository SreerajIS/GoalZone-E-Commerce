const mongoose = require('mongoose')
const couponSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
  },
  code:{
    type: String,
    required: true
  },
  price:{
    type:Number,
    require:true
  },
  date:{
    type:Date,
    require:true
  },
  usedBy:[
    {type:mongoose.Schema.Types.ObjectId}
  ],
  status:{
    type:Boolean,
    default:true
  }
})


const Coupon =  mongoose.model("Coupon", couponSchema);

module.exports = Coupon;