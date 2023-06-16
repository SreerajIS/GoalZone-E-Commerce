const mongoose = require('mongoose')
const walletSchema = new mongoose.Schema({
  date:{
    type: Date,
    required: true
  },
  price:{
    type: Number,
    required: true
  }
})


const Wallet =  mongoose.model("Wallet", walletSchema);

module.exports = Wallet;