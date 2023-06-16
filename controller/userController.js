const {response} = require('express');
const User = require("../models/users")
const bcrypt = require("bcryptjs")
const client = require('twilio')(process.env.TWILIO_ID, process.env.TWILIO_TOKEN);
const Product = require('../models/product')
const Cart = require('../models/cart')
const Address = require('../models/address')
const Razorpay = require('razorpay');
const ObjectId = require("mongoose").Types.ObjectId;
const Order = require('../models/order')
const userHelper = require("../helpers/userHelper")
const Coupon = require("../models/coupon")
const Category = require("../models/categories")
const Offer = require("../models/offer")
const Wallet = require("../models/wallet")

var instance = new Razorpay({
  key_id: process.env.RAZ_KEY_ID,
  key_secret: process.env.RAZ_SECRET_KEY,
});

var random, userPhone

module.exports = {
  intro: async(req,res)=>{
   try {
     let offer = await Offer.find()
     res.render('user/index',{title:"GoalZone", logout:true,offer})
   } catch (error) {
    res.status(500).render("error",{error})
   }
  },
  userLogin: async(req,res)=>{
    try {
      res.render('user/login',{title:"Login Page", logout:true, layout:'./layouts/plain_layout', message:req.flash('message')})
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  userSignup: async(req,res)=>{
    try {
      res.render('user/signup',{title:"Signup Page", logout:true, layout:'./layouts/plain_layout',message: req.flash('message')})
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  loginPost: async(req,res)=>{
    try{
      const email = req.body.email
      const password = req.body.password
  
      const useremail = await User.findOne({email:email});
      const isMatch = await bcrypt.compare(password, useremail.password)
      if(!useremail.status){
        if(isMatch){
          req.session.user = useremail
          res.status(201).redirect('/home')
        }else{
          req.flash('message',"Password are not matching")
          res.redirect('/login')
        }
      }
      else{
        req.flash('message',"User Blocked")
        res.redirect('/login')
      }
      
      
    }
    catch{
      req.flash('message',"Invalid email")
      res.redirect('/login')
    }
  },
  signupPost: async(req,res)=>{
    try {
      const email = req.body.email
      let userEmail = await User.findOne({email:email})
      const password = req.body.password;
      const cpassword = req.body.confirmpassword;
      if(userEmail==null||email != userEmail.email){
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
      else {
        
        req.flash('message',"Email already exists")
        res.redirect('/signup')

      }
    } catch (error) {
      res.status(500).render("error",{error})
    }

      
  },
  home: async(req,res)=>{
    try {
      let offer = await Offer.find()
      res.render('user/index',{title:"Home Page", logout:false,offer})
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  otplogin: async(req,res)=>{
    try {
      res.render('user/otplogin',{title:"OTP Login", logout:true,layout:'./layouts/plain_layout',message:req.flash('message') })
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  otpverification: async(req,res)=>{
    try {
      res.render('user/otpverification',{title:"OTP Verification", logout:true,layout:'./layouts/plain_layout',message:req.flash('message') })
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  otploginPost: async(req,res)=>{
    try {
      const number = req.body.phone;
      userPhone = await User.findOne({phone:number})
      console.log(userPhone)
      if(userPhone != null)
      {
        random = Math.floor(Math.random()*90000) + 10000;
        console.log(random)
      client.messages
        .create({body: random, from: '+16205089648', to:'+91'+number})
        .then(message => console.log(message.sid))
        .catch(error => console.log(error))
        res.redirect('/otpverification')
      }
      else{
        req.flash('message','Invalid Phone number')
        res.redirect('/otplogin')
      }
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
    
  } ,
  otpverificationPost: async(req,res)=>{
    try {
      const otp = req.body.otp
      // console.log(otp)
      if(otp==random){
        req.session.user = userPhone
        res.redirect('/home')
      }
      else{
        req.flash('message','Incorrect OTP')
        res.redirect('/otpverification')
      }
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  logout: async(req,res)=>{
    try {
      req.session.user = false;
      res.redirect('/')
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  shop:async(req,res)=>{
    try {
      await Product.find().then(async(product)=>{
        let categories = await Category.find()
        if(req.session.user){
          res.render('user/shop',{title:"shop",logout:false,product,categories})
        }
        else{
          res.render('user/shop',{title:"shop",logout:true,product,categories})
        }
        
      }).catch((error)=>{
        console.log(error)
      })
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
    
  },
  singleProduct:async(req,res)=>{
    try {
      await Product.findOne({_id:req.params.id}).then((product)=>{
        if(req.session.user){
          res.render("user/single-product",{title:"Product Details",logout:false,product})
        }
        else{
          res.render("user/single-product",{title:"Product Details",logout:true,product})
        }
        
      }).catch((error)=>{
        console.log(error)
      })
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
    

    
  },
  cart:async(req,res)=>{
    try {
      // console.log(req.session.user._id)
      let cart = await Cart.findOne({userId:req.session.user._id})
      let exist = false
      if(cart){
        exist = true
        await Cart.findOne({userId:req.session.user._id}).populate({
          path:'product.prodId',
          model:Product,
          select:'name color size description category sub_category image price'
        }).then(async(cartList)=>{
          const total = await Cart.aggregate([
            {$match:{userId:new ObjectId(req.session.user._id)}},
            {$unwind:'$product'},
            {
              $lookup:{
                from:'products',
                localField:'product.prodId',
                foreignField:'_id',
                as:'productLookup'
              }
            },
            { 
              $project:{
                _id:0,
                'productLookup.name':1,
                'productLookup.price':1,
                quantity:'$product.quantity',
                totalPrice:{
                  $multiply:['$product.quantity',{$arrayElemAt:['$productLookup.price',0]}]
                }
              }
            },
            {
              $group:{
                _id:null,
                total:{$sum:'$totalPrice'}
              }
            }
          ])
          const totalPrice = total[0]?.total || 0
          console.log(cartList.product[0].prodId._id)
          res.render("user/cart",{title:"cart",logout:false,cartList,exist,totalPrice,cart})
        })
      }else{
        res.render("user/cart",{title:"cart",logout:false,exist,cart})
      }
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
    
  },
  addcart:async(req,res)=>{
    try {
      if(req.session.user){
        let cart = await Cart.findOne({userId:req.session.user._id})
        if(cart){
          let cartId = cart._id
          let productId = await Cart.findOne({'product.prodId':req.params.id})
          if(productId){
            await Cart.updateOne({_id:cartId,'product.prodId':req.params.id},{$inc:{'product.$.quantity':1}})
          }
          else{
            await Cart.updateOne({_id:cartId},{$push:{product:{ prodId: req.params.id }}})
          }
          
        }else{
          const registerCart = new Cart({
        
            userId: req.session.user._id,
            product:[{prodId: req.params.id }],
            couponCode:"",
            offerCategory:""
          })
          const registered = await registerCart.save()
        }
        res.redirect('/cart')
        
      }
      else{
        res.redirect("/login")
      }
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
    
  },
  deleteCart:async(req,res)=>{
    try {
      let cart = await Cart.findOne({userId:req.session.user._id})
      console.log(cart)
      let prodId  = req.params.id
      let cartId = cart._id
      console.log(cart.product.length)
      if(cart.product.length==1){
        
        await Cart.deleteOne({_id:cartId})
      }
      else{
        await Cart.updateOne({_id:cartId},{
          $pull: { product: { prodId: new ObjectId(prodId) } }
      })
      }
      
      res.redirect('/cart')
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  changeQuantity:async(req,res)=>{
    try {
      let decide = true
      const{cart,product,userId,count,quantity}=req.body
      let carrt = await Cart.find({userId:req.session.user._id})
      console.log(product)
      // count = parseInt(count)

      // quantity = parseInt(quantity)
      const changeQtyPromise =  new Promise(async(resolve,reject)=>{
        console.log(count,quantity)
        if(count ==-1&&quantity==1){
          decide = false
          console.log("ksdlfj")
          if(carrt[0].product.length==1){
            await Cart.deleteOne({_id:cart}).then((response)=>{
              resolve({removeProduct:true})
            })
          }
          else{
            await Cart.updateOne({_id:cart},{
              $pull: { product: { prodId: new ObjectId(product) } }
          }).then((response)=>{
            resolve({removeProduct:true})
          })
          }
            
          
          
        }else{
          try{
            await Cart.updateOne({
              _id: cart,
              'product.prodId':product
            },
            {
              $inc:{'product.$.quantity':count}
            }
            ).then((response)=>{
              resolve({qtyChanged:true})
            })
          }catch(error){
            reject(error)
          }
        }
      })
      let cart2 =await Cart.findOne({_id:cart})
      let getTotalAmtPromise
      if(decide == true){
        getTotalAmtPromise = new Promise(async(resolve,reject)=>{
          try{
            const total = await Cart.aggregate([
              {$match:{userId:new ObjectId(userId)}},
              {$unwind:'$product'},
              {
                $lookup:{
                  from:'products',
                  localField:'product.prodId',
                  foreignField:'_id',
                  as:'productLookup'
                }
              },
              { 
                $project:{
                  _id:0,
                  'productLookup.name':1,
                  'productLookup.price':1,
                  quantity:'$product.quantity',
                  totalPrice:{
                    $multiply:['$product.quantity',{$arrayElemAt:['$productLookup.price',0]}]
                  }
                }
              },
              {
                $group:{
                  _id:null,
                  total:{$sum:'$totalPrice'}
                }
              }
            ])
            
            resolve(total[0].total)
          }catch(error){
            console.log(error)
            reject(error)
          }
        })
      }
      else{
        getTotalAmtPromise = 0
      }
      
      Promise.all([changeQtyPromise,getTotalAmtPromise])
      .then(([changeQtyResponse,totalAmt])=>{
        changeQtyResponse.total = totalAmt
        console.log(changeQtyResponse)
        res.json(changeQtyResponse)
      })
      .catch((error)=>{
        console.log(error)
        res.json({status:false})
      })
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  
  checkout:async(req,res)=>{
    try {
      let coupon = await Coupon.find()
      let offer = await Offer.find()
      let set = new Set()
      console.log(offer)
      for(let i=0;i<offer.length;i++){
        set.add(offer[i].category)
      }
      console.log(coupon)
      await Address.find({userId:req.session.user._id}).then(async(address)=>{
        await Cart.find({userId:req.session.user._id}).then(async(cart)=>{
          await Cart.findOne({userId:req.session.user._id}).populate({
            path:'product.prodId',
            model:Product,
            select:'name color size description category sub_category image price'
          }).then(async(cartList)=>{
            const total = await Cart.aggregate([
              {$match:{userId:new ObjectId(req.session.user._id)}},
              {$unwind:'$product'},
              {
                $lookup:{
                  from:'products',
                  localField:'product.prodId',
                  foreignField:'_id',
                  as:'productLookup'
                }
              },
              { 
                $project:{
                  _id:0,
                  'productLookup.name':1,
                  'productLookup.price':1,
                  quantity:'$product.quantity',
                  totalPrice:{
                    $multiply:['$product.quantity',{$arrayElemAt:['$productLookup.price',0]}]
                  }
                }
              },
              {
                $group:{
                  _id:null,
                  total:{$sum:'$totalPrice'}
                }
              }
            ])
            const totalPrice = total[0]?.total || 0
            console.log("this is cart list",cartList)
            console.log(cartList.product[0].prodId)
            res.render('user/checkout',{title:"checkout",logout:false,address,cartList,totalPrice,coupon,set})
          })
          
        })
        
      })
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
    
  },
  getAccount:async(req,res)=>{
    try {
      let wallet = await Wallet.find().sort({date:-1})
      let user= req.session.user
      let userId = req.session.user._id
      /* let orderId = await Order.find({user:req.session.user._id},'_id')
      let ids = orderId.map(obj=>obj._id) */
      let userAddress = await Address.find({userId:userId})
      let userDetails = await User.findOne({_id:userId})
      await Address.find({userId:req.session.user._id}).then(async(address)=>{
      let orderDetails = await Order.aggregate([
        {$match:{user:new ObjectId(userId)}},
        {$sort:{orderDate:-1}},
        {
          $lookup:{
            from:'addresses',
            localField:'address',
            foreignField:'_id',
            as:'address'
          }
        },
        {
          $lookup:{
            from:'products',
            localField:'orderedItems.prodId',
            foreignField:'_id',
            as:'products'
          }
        }
      ])
      res.render('user/account',{title:'account',logout:false,orderDetails,address,userDetails,wallet})
    
      
        
      })
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
    
  },
  getAddAddress:async(req,res)=>{
    try {
      res.render('user/add-address',{title:'Add Address',logout:false})
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  postAddress:async(req,res)=>{
    try {
      const registerAddress = new Address({
        userId:req.session.user._id,
        name: req.body.name,
        housenumber: req.body.housenumber,
        place: req.body.place,
        state: req.body.state,
        pin: req.body.pin,
        phone: req.body.phone
      })
      const registered = await registerAddress.save();
      res.redirect("/account")
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  postOrder:async(req,res)=>{
    try {
      let payment
      if(req.body.selectedPayment=="cash"){
        payment = "Cash on delivery"
      }
      else if(req.body.selectedPayment=="online"){
        payment = "Razorpay"
      }
      else{
        payment = "Wallet"
      }
      console.log(payment)
      const selectedAddressId = req.body.selectedAddress;
      let cart = await Cart.findOne({userId:req.session.user._id})
      let products = cart.product
      console.log("hello this one",products)
      const total = await Cart.aggregate([
        {$match:{userId:new ObjectId(req.session.user._id)}},
        {$unwind:'$product'},
        {
          $lookup:{
            from:'products',
            localField:'product.prodId',
            foreignField:'_id',
            as:'productLookup'
          }
        },
        { 
          $project:{
            _id:0,
            'productLookup.name':1,
            'productLookup.price':1,
            quantity:'$product.quantity',
            totalPrice:{
              $multiply:['$product.quantity',{$arrayElemAt:['$productLookup.price',0]}]
            }
          }
        },
        {
          $group:{
            _id:null,
            total:{$sum:'$totalPrice'}
          }
        }
      ])
      let totalPrice = total[0]?.total || 0
      console.log("look hereeeee",cart)
      console.log(totalPrice)
      let offerCategory = cart.offerCategory
      let couponCode = cart.couponCode
      console.log(couponCode)
      if(offerCategory !=""){
        let offer = await Offer.find({category:offerCategory})
        let discount = offer[0].price
        totalPrice = totalPrice - discount
        console.log(totalPrice)
      }
      if(couponCode !=""){
        let coupon = await Coupon.find({code:couponCode})
        console.log(coupon)
        let discount = coupon[0].price
        console.log(discount)
        totalPrice = totalPrice- discount
        console.log(totalPrice)
      }
      console.log(selectedAddressId)
      console.log(products,'iiiiiiiiiiiiiiiiiii')
      const registerOrder = new Order({
        address:selectedAddressId,
        orderedItems: products,
        user: req.session.user._id,
        payment:payment,
        orderDate: new Date(),
        totalAmount:totalPrice,
        reason:""
      })
      const registered = await registerOrder.save();
      console.log("hi",registered)
      console.log(registered._id)
      for(let i=0;i<products.length;i++){
        await Product.updateOne({_id:products[i].prodId},{$inc:{quantity:-products[i].quantity}})
      }
      let orderId = registered._id
      if(payment == "Razorpay"){
        var options = {
          amount: totalPrice,  // amount in the smallest currency unit
          currency: "INR",
          receipt: orderId.toString()
        };
        instance.orders.create(options,async function(err, order) {
          if(err){
            console.log(err)
          }
          else{
            console.log("New Order:",order);
            await Cart.deleteOne({userId:req.session.user._id})
            res.json({orders:order,status:true,orderId:orderId})
          }
          
        });
        
      }
      else if(payment=="Cash on delivery"){
        await Cart.deleteOne({userId:req.session.user._id})
        res.json({codSuccess:"cash",orderId:orderId})
      }
      else{
        let user = await User.find({_id:req.session.user._id})
        console.log(user)
        let wallet = user[0].wallet
        console.log("Wallet",wallet)
        if(wallet>totalPrice){
          await Cart.deleteOne({userId:req.session.user._id})
          await User.updateOne({_id:req.session.user._id},{$inc:{wallet:-totalPrice}})
          res.json({codSuccess:"wallet",orderId:orderId,status:true,message:"Payment success"})
        }
        else{
          await Cart.deleteOne({userId:req.session.user._id})
          
          res.json({codSuccess:"wallet",orderId:orderId,status:false,message:"Not enough cash in wallet"})
        }
      }
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
    
  },
  changeStatus:async(req,res)=>{
    try {
      const {text,orderId}= req.body
      await Order.updateOne({_id:orderId},{$set:{reason:text}})
      let order = await Order.findOne({_id:orderId})
      let status = order.orderStatus
      if(status == 'Delivered'){
        await Order.updateOne({_id:orderId},{$set:{orderStatus:'Return Requested'}})
        res.json({response:true})
      }
      else{
        console.log("hi look here")
        await Order.updateOne({_id:orderId},{$set:{orderStatus:'Cancellation Requested'}})
        console.log("this one")
        res.json({response:true})
      }
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  getWomen:async(req,res)=>{
    try {
      await Product.find().then(async(product)=>{
        let categories = await Category.find()
        if(req.session.user){
          res.render('user/women',{title:"shop",logout:false,product,categories})
        }
        else{
          res.render('user/women',{title:"shop",logout:true,product,categories})
        }
        
      }).catch((error)=>{
        console.log(error)
      })
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  getMen:async(req,res)=>{
    try {
      await Product.find().then(async(product)=>{
        let categories = await Category.find()
        if(req.session.user){
          res.render('user/men',{title:"shop",logout:false,product,categories})
        }
        else{
          res.render('user/men',{title:"shop",logout:true,product,categories})
        }
        
      }).catch((error)=>{
        console.log(error)
      })
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  editAddress:async(req,res)=>{
    try {
      await Address.findOne({_id:req.params.id}).then((address)=>{
        res.render('user/editAddress',{title:"Edit Address",logout:false,address})
      })
      
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
    
  },
  postEditAddress:async(req,res)=>{
    try {
      let name = req.body.name
      let housenumber = req.body.housenumber
      let place = req.body.place
      let state = req.body.state
      let pin = req.body.pin 
      let phone = req.body.phone
       await Address.updateOne({_id:req.params.id},{"$set":{"name":name,"housenumber":housenumber,"place":place,"state":state,"pin":pin,"phone":phone}}) 
       res.redirect("/account")          
    } catch (error) {
      res.status(500).render("error",{error})
    }
  },
  deleteAddress:async(req,res)=>{
    try {
      await Address.deleteOne({_id:req.params.id})
      res.redirect('/account')
    } catch (error) {
      res.status(500).render("error",{error})
    }
  },
  getPlaceOrderFinal:async(req,res)=>{
    try {
      res.render('user/thankyou',{title:"Thank You",logout:false})
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
  },
  getVerifyPayment: async (req, res) => {
    try {
      console.log(req.body);
      let orderId = req.body['order[receipt]'];
      console.log(orderId, 'iiiiiiiiiiiiiiii');

      try {
          let body = req.body['payment[razorpay_order_id]'] + '|' + req.body['payment[razorpay_payment_id]'];
          var crypto = require("crypto");
          var expectedSignature = crypto.createHmac('sha256', `${process.env.RAZ_SECRET_KEY}`)
              .update(body.toString())
              .digest('hex');

          if (expectedSignature === req.body['payment[razorpay_signature]']) {
              console.log('its success');

              console.log(orderId, 'int he change status');
              await Order.updateOne(
                  { _id: new ObjectId(orderId) },
                  { $set: { orderStatus: 'Pending' } }
              );

              console.log("status changed");
              res.json({ status: true, orderId: orderId });
          } else {
              console.log('its failure');
              res.json({ status: false, errMsg: 'payment failed' });
          }
      } catch (err) {
          console.log(err);
          res.json({ status: false, errMsg: 'payment failed' });
      }
    } catch (error) {
      res.status(500).render("error",{error})
    }
    
},
getOrderDetails:async(req,res)=>{
  try {
    let userId = req.session.user._id
    let orderId = req.params.id
    console.log("sdfdsfdsf",userId,orderId)
    let orderDetails = await Order.aggregate([
      { $match: { _id: new ObjectId(orderId) } },
      {
        $lookup: {
          from: 'addresses',
          localField: 'address',
          foreignField: '_id',
          as: 'address'
        }
      },
      {
        $lookup: {
          from: 'products',
          let: { orderedItems: '$orderedItems' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$orderedItems.prodId']
                }
              }
            }
          ],
          as: 'products'
        }
      }
    ]);
    console.log(orderDetails)
    let order = orderDetails[0]
    let product = order.products
    console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",product)
    console.log(order)
    console.log(orderDetails[0].address[0])
    console.log(orderDetails[0].products[0])
    console.log(orderDetails[0].products.length)
    let length = orderDetails[0].products.length
    res.render('user/orderdetails',{title:"order details",logout:false,order,length,product})
  } catch (error) {
    res.status(500).render("error",{error})
  }
  
},
postEditProfile:async(req,res)=>{
  try {
    let userId = req.session.user._id
    let name = req.body.name
    let email = req.body.email
    let phone = req.body.phone

    await User.updateOne({_id:userId},{"$set":{"name":name,"email":email,"phone":phone}})
    res.redirect("/account")
  } catch (error) {
    res.status(500).render("error",{error})
  }
  
  
},
applyCoupon :async (req, res) => {
  try {
      const userId = req.session.user._id
      const { totalAmount, couponCode } = req.body;
      console.log("hhhhhhhhhhhhh", couponCode);
      console.log("hhhhhhhhhhhhh", totalAmount);
      console.log("hhhhhhhhhhhhh", totalAmount);
      const response = await userHelper.applyCoupon(userId, couponCode,totalAmount);

      console.log("responseddddddddddddddddd", response);
      res.json(response);

  } catch (error) {
    res.status(500).render("error",{error})
  }
},
getCategoryPage:async(req,res)=>{
  try {
    let subcategory = req.params.name
    let categories = await Category.find()
    await Product.find().then((product)=>{
      if(req.session.user){
        res.render('user/categorypage',{title:"shop",logout:false,product,subcategory,categories})
      }
      else{
        res.render('user/categorypage',{title:"shop",logout:true,product,subcategory,categories})
      }
      
    }).catch((error)=>{
      console.log(error)
    })
  } catch (error) {
    res.status(500).render("error",{error})
  }
  
},
applyOffer:async(req,res)=>{
  try {
    const userId = req.session.user._id
    const { totalAmount,category} = req.body;
    console.log("hhhhhhhhhhhhh", category);
    console.log("hhhhhhhhhhhhh", totalAmount);
    const response = await userHelper.applyOffer(userId,category,totalAmount);

    console.log("responseddddddddddddddddd", response);
    res.json(response);

} catch (error) {
  res.status(500).render("error",{error})
}
},
getNewLogin:async(req,res)=>{
  res.render('user/index2',{title:'ksdjl',logout:true,layout:'./layouts/plain_layout'})
},
getForgotPassword:async(req,res)=>{
  try {
    res.render("user/forgotpassword",{title:"Forgot Password",logout:true,layout:'./layouts/plain_layout',message:req.flash('message') })
  } catch (error) {
    res.status(500).render("error",{error})
  }
},
postForgotPassword:async(req,res)=>{
  try {
    const number = req.body.phone;
    userPhone = await User.findOne({phone:number})
    if(userPhone != null)
    {
      random = Math.floor(Math.random()*90000) + 10000;
      console.log(random)
    client.messages
      .create({body: random, from: '+16205089648', to:'+91'+number})
      .then(message => console.log(message.sid))
      .catch(error => console.log(error))
      res.render('user/verifyotp',{title:"OTP Verification", logout:true,layout:'./layouts/plain_layout',number,random })
    }
    else{
      req.flash('message','Invalid Phone number')
      res.redirect('/forgotpassword')
    }
  } catch (error) {
    res.status(500).render("error",{error})
  }
},
postVerifyOtp:async(req,res)=>{
  try {
    const number = req.params.number
    const otp = req.body.otp
    // console.log(otp)
    if(otp==random){
      res.render("user/changepassword",{title:"Change Password",logout:true,layout:'./layouts/plain_layout',number})
    }
  } catch (error) {
    res.status(500).render("error",{error})
  }
},
postChangePassword:async(req,res)=>{
  try {
    const number = req.params.number
    const password = await bcrypt.hash(req.body.password,10);
    
    await User.updateOne({phone:number},{$set:{password:password}})
    res.redirect('/login')
  } catch (error) {
    res.status(500).render("error",{error})
  }
},
getAbout:async(req,res)=>{
  try {
    res.render('user/about',{title:"About",logout:false})
  } catch (error) {
    
  }
}
}

