const userAuthenticationCheck = async(req,res,next) =>{
  try{
    if(req.session.user){
      res.status(200).redirect('/home')
    }
    else{
      next()
    }
  }
  catch(error){
    res.status(500).send(error)
  }
}

const userChecking = async(req,res,next)=>{
  try{
    if(req.session.user){
      next()
    }
    else{
      res.status(200).redirect('/')
    }
  }
  catch(error){
    res.status(500).send(error)
  }
}

const adminAuthenticationChecking  = async(req,res,next)=>{
  try{
    if(req.session.admin){
      res.redirect('/admin')
    }
    else{
      next()
    }
  }
  catch(error){
    res.statud(500).send(error)
  }
}

const adminChecking = async(req,res,next)=>{
  try {
    if(req.session.admin){
      next()
    }
    else{
      res.status(200).redirect('/admin/login')
    }
  } catch (error) {
    res.status(500).send(error)
  }
}

module.exports = {
  userAuthenticationCheck,
  userChecking,
  adminAuthenticationChecking,
  adminChecking
}