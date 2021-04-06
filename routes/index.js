 var express = require('express');
var router = express.Router();
var userModule=require('../module/user');
var bcrypt=require('bcryptjs');
var jwt = require('jsonwebtoken');
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

//check user login or not
function checkuserlogin(req,res,next){
  var userToken=localStorage.getItem('userToken');
  try{
    var decoded=jwt.verify(userToken,'loginToken');
  }
  catch(err){
    res.redirect('/');
  }
next();
}

//check duplicate email
function check_email(req,res,next){
  var email=req.body.email;
  var check_dup_email=userModule.findOne({email:email});
  check_dup_email.exec((err,data)=>{
    if(err) throw err;
    if(data){
      res.render('Signup', { title: 'Signup',msg:'email already exit' });
    }
    next();
  }
  );
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Login' ,msg:''});
});
router.post('/', function(req, res, next) {
  var username=req.body.uname;
  var password=req.body.password;
  var user_val=userModule.findOne({username:username});
  user_val.exec((err,data)=>{
    if(err) throw err;
    var getPassowrd=data.password;
  
    var getUserID=data._id;
    if(bcrypt.compareSync(req.body.password,getPassowrd)){
      var token = jwt.sign({ userId:getUserID },'loginToken');
      localStorage.setItem('userToken', token);
      localStorage.setItem('loginUser',username);
      res.redirect('/dashboard');
    }
    else{
      res.render('index', { title: 'Login' ,msg:'Username or Password not matched'});
    }
  } 
  );
  
});

router.get('/logout',function(req,res,next){
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});

router.get('/dashboard',checkuserlogin,  function(req, res, next) {
  loginUser=localStorage.getItem('loginUser')
  res.render('dashboard', { title: 'Login',loginUser:loginUser,msg:'' });
});


router.get('/Signup', function(req, res, next) {
  res.render('Signup', { title: 'Login',msg:'' });
});

router.post('/Signup',check_email, function(req, res, next) {
var username=req.body.uname;
var email=req.body.email;
var password=req.body.password;
var cnfpswd=req.body.confpassword;
if(password!=cnfpswd){
  res.render('Signup', { title: 'Signup',msg:'password not matched' });
}
else{
  password=bcrypt.hashSync(req.body.password,10);
var userDetails=userModule({
username:username,
email:email,
password:password,
});
userDetails.save((err,doc)=>{
  if(err) throw err;
  res.render('Signup', { title: 'Signup',msg:'successfull' });
});
}
  
});
module.exports = router;
