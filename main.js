require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const path = require('path')
const logger = require('morgan')
const expressLayouts = require('express-ejs-layouts')
const { connect } = require('http2')
require("./db/conn")
const User = require("./models/users")
// const bcrypt = require("bcrypt")
const bcrypt = require("bcryptjs")
var flash = require("connect-flash")
const nocache = require('nocache')
const multer = require('multer')
const fs = require('fs')
const validator = require('fastest-validator')
const v = new validator()


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
// const router = require('./routes/user')
const app = express()
const PORT = process.env.PORT || 4000;

//database connection
/* const database = module.exports = () =>{
  const connectionParams ={
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
  try {
    mongoose.connect('mongodb+srv://sreeraj:coQ5Z6on8brPwyh5@cluster0.wme9dvf.mongodb.net/test')
    console.log('Database connected successfully now')
  }catch(error){
    console.log(error)
    console.log('Database connection failed')
  }
}
database(); */
//middleware
app.use(logger('dev'))
app.use(express.urlencoded({extended: false}));
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser( ))
app.use(nocache())
app.use(session({
  key:'user_sid',
  secret: 'my secret key',
  cookie:{maxAge: 6000000},
  saveUninitialized: true,
  resave: false 
}))
app.use(flash())



app.use((req,res,next)=>{
  res.locals.message = req.session.message;
  delete req.session.message
  next()
})

app.use(expressLayouts)
// app.set('layout', './layouts/layout')

app.set('view engine', 'ejs');

/* const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "uploads");
  },
  filename: (req, file, cb) => {
      console.log(file);
      cb(null, Date.now() + path.extname(file.originalname));
  },
});

app.use(multer({
  storage: storage,
}).single('image'));

app.use(express.static(path.join(__dirname, 'uploads'))); */

const storage=multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')

    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const timestamp = Date.now();
      const newFilename = `${timestamp}_${path.basename(file.originalname, ext)}.jpg`;
      cb(null, newFilename);
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
        cb(new Error('Only jpeg and png files are allowed'));
        return;
      } else {
        cb(null, true);
        return
      }
    }
    
});

app.use(multer({
  dest: 'uploads',
  storage: storage,
  limits: { fileSize: 1024 * 1024 } // 1MB
}).array('image',3));

app.use(express.static(path.join(__dirname, 'uploads')));


app.use('/',(req,res,next) =>{
  res.locals.layout = 'layouts/layout'
  next()
})
app.use('/admin',(req,res,next) =>{
  res.locals.layout = 'layouts/adminlayout'
  next()
})
app.use(express.static(path.join(__dirname,'public')))

//route prefix
app.use('/',userRouter)
app.use('/admin', adminRouter)

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{title:"error",logout:true, layout:'./layouts/plain_layout'});
});

app.listen(PORT, ()=>{
  console.log('Server started at http://localhost:'+PORT)
})

