const mongoose = require('mongoose')
const offerSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
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
  category:{
    type:String
  },
  status:{
    type:Boolean,
    default:true
  }
})


const Offer =  mongoose.model("Offer", offerSchema);

module.exports = Offer;