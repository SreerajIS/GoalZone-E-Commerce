/* const express=require('express');
const route=express.Router();
const User = require("../models/users")
const bcrypt = require('bcryptjs')


route.get('/',(req, res)=>{
  res.render('user/index',{title:"GoalZone", logout:true})
})
route.get('/login',(req, res)=>{
  res.render('user/login',{title:"Login Page", logout:true, layout:'./layouts/plain_layout'})
})
route.post('/login',async(req,res)=>{
  try{
    const email = req.body.email
    const password = req.body.password

    const useremail = await User.findOne({email:email});
    const isMatch = await bcrypt.compare(password, useremail.password)
    if(isMatch){
      res.status(201).redirect('/home')
    }else{
      res.send('password are not matching')
    }
  }
  catch{
    res.status(400).send("invalid email")
  }
})
route.get('/signup',(req, res)=>{
  res.render('user/signup',{title:"Signup Page", logout:true, layout:'./layouts/plain_layout',message: req.flash('message')})
})
route.post('/signup', async(req,res)=>{
  try{
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    if(password === cpassword){
      console.log(req.body)
      const registerUser = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: password,
        confirmpassword: cpassword
      })
      const registered = await registerUser.save();
      res.status(201).redirect('/login');
    }
    else{
      res.send("password are not matching")
    }
  }
  
  catch(error){
    const name = req.body.name;
    const email = req.body.email;
    
    const phone = req.body.phone
    const password = req.body.password;
    let userEmail = await User.findOne({email:email})
    if(name.length<5){
      req.flash('message',"Name must be atleast 5 characters")
    }
    else if(phone.length!=10){
      req.flash('message',"Phone number must be 10 numbers")
    }
    else if(password.length < 8){
      req.flash('message',"Password must be atleast 8 characters")
    }
    else if(email == userEmail.email){
      req.flash('message',"Email already exists")
    }
    // req.flash('message',"Complete the Form");
    res.redirect('/signup')
  }
})
route.get('/home',(req, res)=>{
  res.render('user/index',{title:"Home Page", logout:false})
})
route.get('/about',(req, res)=>{
  res.render('user/about',{title:"About Page", logout:false})
})
route.get('/cart',(req, res)=>{
  res.render('user/cart',{title:"Cart", logout:false})
})
route.get('/checkout',(req, res)=>{
  res.render('user/checkout',{title:"Checkout", logout:false})
})
route.get('/contact',(req, res)=>{
  res.render('user/contact',{title:"Contact Page", logout:false})
})
route.get('/product',(req, res)=>{
  res.render('user/product',{title:"Product", logout:false})
})
route.get('/shop',(req, res)=>{
  res.render('user/shop',{title:"Shop", logout:false})
})
route.get('/thankyou',(req, res)=>{
  res.render('user/thankyou',{title:"Thank You", logout:false})
})

module.exports = route; */

var express = require('express')
const userController = require('../controller/userController');
const {userAuthenticationCheck,userChecking} = require('../middleware/sessionhandler')
var route = express.Router();

route.get('/',userAuthenticationCheck,userController.intro)
route.get('/login',userAuthenticationCheck,userController.userLogin)
route.get('/signup',userAuthenticationCheck,userController.userSignup)
route.post('/signup',userController.signupPost)
route.post('/login',userController.loginPost)
route.get('/home',userChecking,userController.home)
route.get('/otplogin',userAuthenticationCheck,userController.otplogin)
route.post('/otplogin',userController.otploginPost)
route.get('/otpverification',userAuthenticationCheck,userController.otpverification)
route.post('/otpverification',userController.otpverificationPost)
route.get('/logout',userController.logout)
route.get('/shop',userController.shop)
route.get('/single-product/:id',userController.singleProduct)
route.get('/cart',userController.cart)
route.get('/cart/:id',userController.addcart)
route.get('/deleteCart/:id',userController.deleteCart)
route.post('/changeQuantity',userController.changeQuantity)
route.get('/checkout',userController.checkout)
route.get('/account',userController.getAccount)
route.get("/add-address",userController.getAddAddress)
route.post("/add-address",userController.postAddress)
route.post("/order",userController.postOrder)
route.post('/changeStatus',userController.changeStatus)
route.get('/women',userController.getWomen)
route.get('/men',userController.getMen)
route.get('/editAddress/:id',userController.editAddress)
route.post('/edit-address/:id',userController.postEditAddress)
route.get('/deleteAddress/:id',userController.deleteAddress)
route.get('/placeOrderFinal',userController.getPlaceOrderFinal)
route.post('/verifyPayment',userController.getVerifyPayment)
route.get('/orderDetails/:id',userController.getOrderDetails)
route.post('/postEditProfile',userController.postEditProfile)
route.post('/apply-coupon',userController.applyCoupon)
route.get('/category/:name',userController.getCategoryPage)
route.post('/apply-offer',userController.applyOffer)
route.get('/q',userController.getNewLogin)
route.get('/forgotpassword',userController.getForgotPassword)
route.post('/forgotpassword',userController.postForgotPassword)
route.post('/verifyotp/:number',userController.postVerifyOtp)
route.post('/changepassword/:number',userController.postChangePassword)
route.get('/about',userController.getAbout)
module.exports = route;
