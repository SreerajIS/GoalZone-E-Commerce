const mongoose = require('mongoose')
const addressSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId
  },
  name:{
    type:String
  },
  housenumber:{
    type:String
  },
  place:{
    type:String
  },
  state:{
    type:String
  },
  pin:{
    type:Number
  },
  phone:{
    type:Number
  }
})


const Address =  mongoose.model("Address", addressSchema);

module.exports = Address;