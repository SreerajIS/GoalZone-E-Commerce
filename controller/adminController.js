const {response} = require('express');
const email = "admin@gmail.com"
const password = "123"
const user = require('../models/users')
const Category = require('../models/categories')
const Product = require('../models/product')
const Order = require('../models/order')
const Cart = require('../models/cart')
const ObjectId = require("mongoose").Types.ObjectId;
const adminHelper = require("../helpers/adminHelper")
const Coupon = require('../models/coupon')
const Offer = require('../models/offer')
const Wallet = require("../models/wallet")


module.exports = {
  adminHome:async(req,res) =>{
    try {
      let dashboardDetails =await adminHelper.getDashboardDetails()
      let chartData = await adminHelper.getChartDetails()
      console.log(chartData)
      console.log(dashboardDetails.totalRevenue)
      console.log("sjkdhfjkdsh")
      res.render('admin/home',{logout:false,dashboardDetails,chartData})
      
    } catch (error) {
      res.status(404).render('error',{error})
    }
    
  },
  adminLogin:async(req,res)=>{
    try {
      res.render('admin/login',{title:"Admin Login",logout:true,layout:'./layouts/plain_layout',message:req.flash('message')})
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  adminLoginPost:async(req,res)=>{
    try {
      if(req.body.email == email){
        if(req.body.password == password){
          req.session.admin = true
          res.redirect('/admin/')
        }
        else{
          req.flash('message',"Invalid Password")
          res.redirect("/admin/login")
        }
      }
      else{
        req.flash('message',"Invalid Email")
        res.redirect("/admin/login")
      }
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  adminLogout:async(req,res)=>{
    try {
      req.session.admin = false
      res.redirect('/admin/login')
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  adminUserList:async(req,res)=>{
    try {
      let users = await user.find()
      res.render('admin/userList',{title:'User List',logout:false,users})
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  blockUser:async(req,res)=>{
    try {
      console.log(req.params.id);
      await user.updateOne({_id:req.params.id},{$set:{status:true}})
      res.redirect('/admin/userList')
    } catch (error) {
      res.status(500).render('error',{error})
    }
    

  },
  unblockUser:async(req,res)=>{
    try {
      console.log(req.params.id);
      const id = req.params.id.trim()
      await user.updateOne({_id:id},{$set:{status:false}})
      res.redirect('/admin/userList')
      res.send('user found')
    } catch (error) {
      res.status(500).render('error',{error})
    }
  },
  adminCategories:async(req,res)=>{
    try {
      let categories = await Category.find()
      res.render('admin/categories',{title:'Categories',logout:false,message:req.flash('message'),categories})
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  categoryPost:async(req,res)=>{
    try {
      let name = req.body.name
    let description = req.body.description
    let cat = await Category.find({name:{ $regex: new RegExp('^' + name + '$', 'i') }})
    if(cat.length != 0){
      req.flash('message','Category exists')
      res.redirect('/admin/categories')
    } 
    else{
      const registerCategory = new Category({
        name : name,
        description : description
      })
      const registered = await registerCategory.save()
      res.redirect('/admin/categories')
    }
      
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  deleteCategory: async(req,res)=>{
    try {
      await Category.deleteOne({_id:req.params.id})
      res.redirect('/admin/categories')
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  addProduct: async(req,res)=>{
    try {
      await Category.find({},{description:0}).then((categories)=>{
        console.log(categories)
        res.render('admin/addProduct',{title:'Add Product', logout:false,categories})
      }).catch((error)=>{
        console.log(error)
      })
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
    
  },
  productPost: async(req,res)=>{
    try {
      console.log(req.body)
      console.log(req.file);
      var image = req.files
      const registerProduct = new Product({
        
        name: req.body.name,
        category: req.body.category,
        quantity:req.body.quantity,
        sub_category:req.body.sub_category,
        color:req.body.color,
        size: req.body.size,
        description:req.body.description,
        image:image.map(files=>files.filename),
        price:req.body.price
      })
      const registered = await registerProduct.save()
      res.redirect('/admin/product-list')
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  productList:async(req,res)=>{
    try {
      await Product.find().then((product)=>{
        res.render("admin/product-list",{title:'Product List',logout:false,product})
      }).catch((error)=>{
        console.log(error)
      })
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
    
  },
  unlistProduct:async(req,res)=>{
    try {
      await Product.updateOne({_id:req.params.id},{$set:{status:false}})
      res.redirect("/admin/product-list")
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  listProduct:async(req,res)=>{
    try {
      await Product.updateOne({_id:req.params.id},{$set:{status:true}})
      res.redirect("/admin/product-list")
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  editProduct:async(req,res)=>{
    try {
      await Category.find({},{description:0}).then(async(categories)=>{
        await Product.findOne({_id:req.params.id}).then((product)=>{
          res.render('admin/editProduct',{title:'Edit Product',logout:false,categories,product})
        })
        
      }).catch((error)=>{
        console.log(error)
      })
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
    
  },
  updateProduct:async(req,res)=>{
    try {
      let name = req.body.name
      let category =req.body.category
      let color = req.body.color
      let size = req.body.size
      let subcategory =req.body.sub_category
      let price = req.body.price
      let description = req.body.description
      let quantity =  req.body.quantity
      console.log(req.body)
      await Product.updateOne({_id:req.params.id},{"$set":{"name":name,"category":category,"sub_category":subcategory,"color":color,"quantity":quantity,"price":price,"size":size,"description":description}})
        res.redirect("/admin/product-list")
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
    
  },
  getOrderList:async(req,res)=>{
    try {
      let orderDetails = await Order.aggregate([
        {$sort:{orderDate:-1}},
        {
          $lookup:{
            from:'users',
            localField:'user',
            foreignField:'_id',
            as:'users'
          }
        }
      ])
      console.log(orderDetails)
      res.render("admin/order-list",{title:'Order Details,',logout:false,orderDetails})
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  changeStatus:async(req,res)=>{
    try {
      console.log("may you look here")
      let id = req.params.id
      let value = req.body.status
      let order = await Order.findOne({_id:id})
      let userId = order.user
      let orderItems = order.orderedItems
      for(let i=0;i<orderItems.length;i++){
        await Product.updateOne({_id:orderItems[i].prodId},{$inc:{quantity:orderItems[i].quantity}})
      }
      await Order.updateOne({_id:id},{$set:{orderStatus:value}})
      if(value == "Cancelled"){
        console.log("hhhhhhhhhhhhhhhhhhffffffffffffffffgggggggggggggggg")
        if(order.payment =="Wallet"||order.payment=="Razorpay"){
          await user.updateOne({_id:userId},{$inc:{wallet:order.totalAmount}})
          const registerWallet = new Wallet({
			
            price:order.totalAmount,
            date:new Date()
          })
          const registered = await registerWallet.save()
        }
      }
      else if(value == "Returned"){
        await user.updateOne({_id:userId},{$inc:{wallet:order.totalAmount}})
        const registerWallet = new Wallet({
			
          price:order.totalAmount,
          date:new Date()
        })
        const registered = await registerWallet.save()
      }
      res.redirect("/admin/order-list")
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  getOrderDetails:async(req,res)=>{
    try {
      let orderId = req.params.id;
      console.log("sdfdsfdsf", orderId);
      let orderDetails = await Order.aggregate([
        { $match: { _id: new ObjectId(orderId) } },
        {
          $lookup: {
            from: "addresses",
            localField: "address",
            foreignField: "_id",
            as: "address",
          },
        },
        {
          $lookup: {
            from: "products",
            let: { orderedItems: "$orderedItems" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$orderedItems.prodId"],
                  },
                },
              },
            ],
            as: "products",
          },
        },
      ]);
      console.log(orderDetails);
      let order = orderDetails[0];
      console.log(order);
      console.log(orderDetails[0].address[0]);
      console.log(orderDetails[0].products[0]);
      console.log(orderDetails[0].products.length);
      let length = orderDetails[0].products.length;
      let address = orderDetails[0].address[0]
      res.render('admin/order-details',{title:"Order details",logout:false,order,length,address})
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  getSalesReport:async(req,res)=>{
    try {
      const sales = await adminHelper.getAllDeliveredOrders();
      console.log("sales",sales);
      res.render('admin/salesreport',{title:"sales report",logout:false,sales})
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  salesReport:async(req,res)=>{
    try {
      let {startDate,endDate}=req.body;
  
      startDate=new Date(startDate)
      endDate=new Date(endDate)
  
      const salesReport = await adminHelper.getAllDeliveredOrdersByDate(startDate,endDate);
      for(let i=0;i<salesReport.length;i++){
        salesReport[i].orderDate=dateFormat(salesReport[i].orderDate)
        salesReport[i].totalAmount=currencyFormat(salesReport[i].totalAmount)
      }
      res.status(200).json({sales:salesReport})
    } catch (error) {
      res.status(500).render('error',{error})
    }
  },
  getAddCoupon:async(req,res)=>{
    try {
      res.render('admin/addCoupon',{title:"Add Coupon",logout:false})
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  postAddCoupon:async(req,res)=>{
    try {
      const registerCoupon = new Coupon({
      
        name: req.body.name,
        code:req.body.code,
        price:req.body.price,
        date:req.body.date
      })
      const registered = await registerCoupon.save()
      res.redirect('/admin/listCoupon')
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  getCouponList:async(req,res)=>{
    try {
      let coupon = await Coupon.find()
      res.render("admin/couponList",{title:"Coupon List",logout:false,coupon})
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  deactivateCoupon:async(req,res)=>{
    try {
      await Coupon.updateOne({_id:req.params.id},{$set:{status:false}})
      res.redirect('/admin/listCoupon')
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  activateCoupon:async(req,res)=>{
    try {
      console.log(req.params.id)
      await Coupon.updateOne({_id:req.params.id},{$set:{status:true}})
      res.redirect('/admin/listCoupon')
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  getAddOffer:async(req,res)=>{
    try {
      let categories = await Category.find()
      res.render("admin/addOffer",{title:"Add Offer",logout:false,categories})
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  postAddOffer:async(req,res)=>{
    try {
      const registerOffer = new Offer({
      
        name: req.body.name,
        category:req.body.sub_category,
        price:req.body.price,
        date:req.body.date
      })
      const registered = await registerOffer.save()
      res.redirect('/admin/listOffer')
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  getOfferList:async(req,res)=>{
    try {
      let offer = await Offer.find()
      res.render("admin/offerList",{title:"Offer List",logout:false,offer})
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  deactivateOffer:async(req,res)=>{
    try {
      await Offer.updateOne({_id:req.params.id},{$set:{status:false}})
      res.redirect('/admin/listOffer')
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  },
  activateOffer:async(req,res)=>{
    try {
      console.log(req.params.id)
      await Offer.updateOne({_id:req.params.id},{$set:{status:true}})
      res.redirect('/admin/listOffer')
    } catch (error) {
      res.status(500).render('error',{error})
    }
    
  }
}