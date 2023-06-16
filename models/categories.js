const mongoose = require('mongoose')
const categorySchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
    minlength: 4
  },
  description:{
    type: String,
    required: true
  }
})


const Category =  mongoose.model("Category", categorySchema);

module.exports = Category;