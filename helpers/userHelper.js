const {response} = require('express');
const Coupon = require('../models/coupon')
const Cart = require('../models/cart')
const Offer = require('../models/offer')

module.exports ={
  applyCoupon: (userId, couponCode, totalAmount) => {
    return new Promise(async (resolve, reject) => {
        let coupon = await Coupon.findOne({ code: couponCode });
        console.log("couponnnnnn", coupon);

        if (coupon && coupon.status == true) {
            if (!coupon.usedBy.includes(userId)) {
                let cart = await Cart.updateOne({ userId: userId },{$set:{couponCode:couponCode}})
                console.log("HIIIIIII",cart)
                const discount=coupon.price
                // console.log("cartttttttt", cart);

                // totalAmount=totalAmount-coupon.discount
                // console.log("1111111111111",typeof totalAmount);
                totalAmount = totalAmount - discount;
                // cart.coupon=couponCode;
                // console.log("2222222222222",typeof cart.totalAmount);
                // await cart.save()
                // console.log("3333333333333");
                coupon.usedBy.push(userId);
                await coupon.save()
                console.log("ccc");
                console.log(discount);
                // console.log(cart);
                console.log(totalAmount);
    
                resolve({  status: true,totalAmount, message: "coupon added successfully" })
            } else {
                resolve({ status: false, message: "Coupon code already used" })
            }
        } else {
            resolve({ status: false, message: "invalid Coupon code" })
        }
    })
},
applyOffer: (userId,category,  totalAmount) => {
    return new Promise(async (resolve, reject) => {
        let offer = await Offer.findOne({ category: category });
        console.log("couponnnnnn", offer);

        if (offer && offer.status == true) {
            if (!offer.usedBy.includes(userId)) {
                let cart = await Cart.updateOne({ userId: userId },{$set:{offerCategory:category}})
                console.log("HIIIIIII",cart)
                const discount=offer.price
                // console.log("cartttttttt", cart);

                // totalAmount=totalAmount-coupon.discount
                // console.log("1111111111111",typeof totalAmount);
                totalAmount = totalAmount - discount;
                // cart.coupon=couponCode;
                // console.log("2222222222222",typeof cart.totalAmount);
                // await cart.save()
                // console.log("3333333333333");
                offer.usedBy.push(userId);
                await offer.save()
                console.log("ccc");
                console.log(discount);
                // console.log(cart);
                console.log(totalAmount);
    
                resolve({  status: true,totalAmount, message: "Offer added successfully" })
            } else {
                resolve({ status: false, message: "Offre code already used" })
            }
        } else {
            resolve({ status: false, message: "invalid Offer" })
        }
    })
}
}