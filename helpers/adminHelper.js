const {response} = require('express');
const Order = require('../models/order')
const Product = require('../models/product')
const Category = require('../models/categories')
module.exports ={

  getDashboardDetails:async () => {
    return new Promise(async (resolve, reject) => {
        let response = {}
        let totalRevenue, monthlyRevenue, totalProducts;

        totalRevenue = await Order.aggregate([
            {
                $match: { orderStatus: { $in: [ 'Delivered'] } }  
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ])
        response.totalRevenue = totalRevenue[0].revenue;

        monthlyRevenue = await Order.aggregate([
            {
                $match: {
                  orderStatus: { $in: [ 'Delivered'] },
                  orderDate: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ])
        response.monthlyRevenue = monthlyRevenue[0]?.revenue

        totalProducts = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$quantity" }
                }
            }
        ])
        response.totalProducts = totalProducts[0]?.total;

        response.totalOrders = await Order.find({ orderStatus: 'Delivered' }).count();

        response.numberOfCategories = await Category.find({}).count();

        console.log(response);
        console.log("vvv");
        resolve(response)
    })
  },



  getChartDetails:async()=>{
    return new Promise(async(resolve,reject)=>{
      const orders = await Order.aggregate([
        {
          $match:{orderStatus:'Delivered'}
        },
        {
          $project:{_id:0,orderDate:"$orderDate"}
        }
        
      ])
      let monthlyData = []
      let dailyData = []

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      let monthlyMap = new Map();
      let dailyMap = new Map();

      //converting to monthly order array

      //taking the count of orders in each month
      orders.forEach((order) => {
          const date = new Date(order.orderDate);
          const month = date.toLocaleDateString('en-US', { month: 'short' });

          if (!monthlyMap.has(month)) {
              monthlyMap.set(month, 1);
          } else {
              monthlyMap.set(month, monthlyMap.get(month) + 1);
          }
      })

      for (let i = 0; i < months.length; i++) {
          if (monthlyMap.has(months[i])) {
              monthlyData.push(monthlyMap.get(months[i]))
          } else {
              monthlyData.push(0)
          }
      }

      //taking the count of orders in each day of a week
      orders.forEach((order) => {
          const date = new Date(order.orderDate);
          const day = date.toLocaleDateString('en-US', { weekday: 'long' })

          if (!dailyMap.has(day)) {
              dailyMap.set(day, 1)
          } else {
              dailyMap.set(day, dailyMap.get(day) + 1)
          }
      })

      for (let i = 0; i < days.length; i++) {
          if (dailyMap.has(days[i])) {
              dailyData.push(dailyMap.get(days[i]))
          } else {
              dailyData.push(0)
          }
      }

      resolve({ monthlyData: monthlyData, dailyData: dailyData})
    })
  },
  getAllDeliveredOrders: () => {
    return new Promise(async (resolve, reject) => {
        await Order.aggregate([
            {
                $match: { orderStatus: 'Delivered' }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            }
        ])
            .then((result) => {
                resolve(result)
            })
    })
},
getAllDeliveredOrdersByDate: (startDate, endDate) => {
  return new Promise(async (resolve, reject) => {
      await Order.find({ orderDate: { $gte: startDate, $lte: endDate }, orderStatus: 'Delivered' }).lean()
          .then((result) => {
              console.log("orders in range", result);
              resolve(result)
          })

  })

}
}