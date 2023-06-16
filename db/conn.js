const mongoose = require("mongoose")


const database = module.exports = () =>{
  const connectionParams ={
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
  try {
    mongoose.connect('mongodb+srv://sreeraj:coQ5Z6on8brPwyh5@cluster0.wme9dvf.mongodb.net/first_project')
    console.log('Database connected successfully now')
  }catch(error){
    console.log(error)
    console.log('Database connection failed')
  }
}
database();