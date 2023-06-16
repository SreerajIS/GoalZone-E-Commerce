const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
  name:{
    type: String,
    /* required: [true,'Name is required'],
    trim: true */
  },
  email:{
    type: String
   /*  required: [true, 'Email is required'],
    unique:true,
    lowercase: true,
    trim : true,
    match:[/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email is invalid'] */
  },
  phone:{
    type: String,
    /* required: [true, 'Phone number is required'],
    match :[/^\d{10}$/, 'Phone number is invalid'] */
  },
  password:{
    type: String,
    /* required: [true, 'Password is required'],
    minlength: [8, 'Password must be atleast 8 characters long'],
    trim : true */
  },
  confirmpassword:{
    type: String,
    /* required:[true,'Confirm Password is required'],
    trim:true */
  },
  status:{
    type: Boolean,
    default: false
  },
  wallet:{
    type:Number,
    default:0
  }
})

userSchema.pre("save",async function(next){
  if(this.isModified("password")){
    // const passwordHash = await bcrypt.hash(this.password,10);
    console.log('the current password is'+this.password);
    this.password = await bcrypt.hash(this.password,10);
    console.log('the current password is'+this.password);

    this.confirmpassword = undefined
  }
  
  next();

})

const User =  mongoose.model("User", userSchema);
const OTP = new mongoose.model("OTP",userSchema)

module.exports = User;
