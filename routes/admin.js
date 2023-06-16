const express=require('express');
const adminController = require('../controller/adminController');
const { adminAuthenticationChecking, adminChecking } = require('../middleware/sessionhandler');
const route=express.Router();


route.get('/',adminChecking,adminController.adminHome)
route.get('/login',adminAuthenticationChecking,adminController.adminLogin)
route.post('/login',adminController.adminLoginPost)
route.get('/logout',adminController.adminLogout)
route.get('/userList',adminController.adminUserList)
route.get('/blockUser/:id',adminController.blockUser)
route.get('/unblockUser/:id',adminController.unblockUser)
route.get('/categories',adminController.adminCategories)
route.post('/categories',adminController.categoryPost)
route.get('/deleteCategory/:id',adminController.deleteCategory)
route.get('/addProduct',adminController.addProduct)
route.post("/addProduct",adminController.productPost)
route.get("/product-list",adminController.productList)
route.get('/unlistProduct/:id',adminController.unlistProduct)
route.get('/listProduct/:id',adminController.listProduct)
route.get('/editProduct/:id',adminController.editProduct)
route.post("/updateProduct/:id",adminController.updateProduct)
route.get("/order-list",adminController.getOrderList)
route.post("/changeStatus/:id",adminController.changeStatus)
route.get("/order-details/:id",adminController.getOrderDetails)
route.get("/salesreport",adminController.getSalesReport)
route.get("/add-coupon",adminController.getAddCoupon)
route.get("/listCoupon",adminController.getCouponList)
route.get("/deactivateCoupon/:id",adminController.deactivateCoupon)
route.get("/activateCoupon/:id",adminController.activateCoupon)
route.post("/addCoupon",adminController.postAddCoupon)
route.get("/addOffer",adminController.getAddOffer)
route.post("/addOffer",adminController.postAddOffer)
route.get("/listOffer",adminController.getOfferList)
route.get("/deactivateOffer/:id",adminController.deactivateOffer)
route.get("/activateOffer/:id",adminController.activateOffer)

module.exports=route