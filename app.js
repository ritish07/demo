var express = require("express");
var app = express(); 
var bodyParser = require("body-parser");

var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var passportLocalMongoose = require("passport-local-mongoose");
var mongoose = require("mongoose");
var nodemailer = require('nodemailer');
var flash = require('connect-flash')
var methodOverride = require('method-override')
var cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require('uuid');
var async = require('async');
var crypto = require('crypto')
const {DB, PORT, HOST} = require("./config")
var cors = require('cors')
var middleware = require("./middleware/index");


const startDatabase = ()=>{
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useUnifiedTopology', true);
  mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(()=>{
    console.log("database connected succesfully");
  }).catch((err) =>{
    console.log(err)
    console.log("database connection error");
  })  
}
startDatabase();

app.use(cors())

app.locals.moment = require('moment');
var Post = require('./models/post.js');
var User = require('./models/user.js');
// var Admin = require('./models/admin.js');
// var Author = require('./models/author.js')

var userRoutes = require('./routes/users.js')
var postRoutes = require('./routes/posts.js')
var adminRoutes = require('./routes/admin.js');
const middlewareObj = require("./middleware");
const { profile } = require("console");
app.use(require("express-session")({
	secret: "learners secret",
	resave: false,
	saveUninitialized: false 
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine" , "ejs");
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'))
passport.use('local-user', new LocalStrategy(User.authenticate()));
// passport.use('admin-user', new LocalStrategy(Admin.authenticate()));
// passport.use('author-user', new LocalStrategy(Author.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function(user, done) {
  // console.log("user id in serialize user is")
  // console.log(user.id)
  console.log("the user in serialize user is")
  console.log(user)
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null,user)
  // User.findById(id, (err,user)=>)
  //   User.findOne({google_id: id}, (err,user)=>{
    
  //     if(!user){
      
  //       User.findById(id, (err,user)=>{
  //         console.log("user id in deserialize user is")
  //         // console.log(user.id)
  //         console.log("and the user is")
  //         console.log(user)
  //         done(err,user)
  //       }) 

  //     } else {
  //     console.log("user id in deserialize user is")
  //     // console.log(user.id)
  //     console.log("and the user is")
  //     console.log(user)
  //     done(err,user)
  //     }
    
  // })
  
  
});

app.use(express.static(__dirname + "/public"));
app.use(flash())
app.use(function (req, res, next) {
  res.locals.currentUser = req.user || null;
  next();
});

app.use("/posts",postRoutes)
app.use("/",userRoutes)
app.use("/",adminRoutes)



// cookies
app.get("/private", (req, res) => {
  var userid = createUserId();
  console.log(userid);
  sendUserIdCookie(userid, res);
  console.log(getAllCookies(req));
  console.log(getUserId(req,res));
});

app.get("/deleteCookie", (req, res) => {
  res.clearCookie('token', {path: '/'}).send("deleted cookie");
});

function createUserId(){
  var userid = uuidv4();
  return userid;
}

function sendUserIdCookie(userID, res){
  var oneday = Date.now() + 24*60*60*60;
  res.cookie("userId", userID, {
  
    maxAge: oneday
  });
};

function getAllCookies(req){
  var rawcookies = req.headers.cookie.split(';');
  var parsedcookies = {};
  rawcookies.forEach(raw =>{
    var parsedcookie = raw.split('=');
    parsedcookies[parsedcookie[0]] = parsedcookie[1];
  })
  return parsedcookies;
}

function getUserId(req, res){
  return getAllCookies(req)['userId'];
} 

app.listen(PORT, HOST , function(){
  console.log("server has started at ", PORT, " with host as ", HOST);
})