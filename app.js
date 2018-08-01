var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
// var methodOverride = require("method-override");
var expressSession = require("express-session");
var User = require("./models/userModel.js");
var flash = require("connect-flash");

// Auth
var passport = require("passport");
var LocalStrategy = require("passport-local");


// mongoose.connect("mongodb://localhost/to-do-list");
//mongodb://<dbuser>:<dbpassword>@ds046867.mlab.com:46867/rdollent-todo
//mongodb://roo:123456@ds046867.mlab.com:46867/rdollent-todo

// environment variable

// to create environment variable
// in command line do
// export DATABASEURL (any name, allcaps) = mongodb://roo:123456@ds129043.mlab.com:29043/rdyelpcamp
// or
// export DATABASEURL (any name, allcaps) = mongodb://localhost/yelp_camp_v13

// console.log(process.env.DATABASEURL);
// mongoose.connect("mongodb://localhost/yelp_camp_v13"); //will create yelp_camp database
//  mongoose.connect("mongodb://roo:123456@ds129043.mlab.com:29043/rdyelpcamp"); //will create yelp_camp database
// mongodb://roo:123456@ds129043.mlab.com:29043/rdyelpcamp
// mongodb://<dbuser>:<dbpassword>@ds129043.mlab.com:29043/rdyelpcamp

// for heroku environment
// go to app, go to settings, reveal config variables
// add variable called DATABASEURL as variable name (key)
// value is mongodb://roo:123456@ds129043.mlab.com:29043/rdyelpcamp
// or using heroku nodejs support documentation "customizing the build process" section
// heroku config:set (key)=(value) in the terminal
// heroku config:set DATABASEURL=mongodb://roo:123456@ds129043.mlab.com:29043/rdyelpcamp

// backup in case environment variable does not work
var url = process.env.DATABASEURL || "mongodb://localhost/to-do-list";
mongoose.connect(url);

// for forms (req.body...)
// in order to read HTTP POST data , we have to use "body-parser" node module.
// body-parser is a piece of express middleware that reads a form's input 
// and stores it as a javascript object accessible through req.body
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// dirname is where the script is ran from console.log(__dirname)
// console.log(__dirname); is /home/ubuntu/workspace/todo
app.use(express.static(__dirname + "/public"));

// use methods for deleting and other things, can use whatever name but docs use _method
// NOTE MUST PLACE IN app.js BEFORE ROUTES
// app.use(methodOverride("_method"));

//use connect-flash for flash messages, need to come BEFORE Passport configuration
app.use(flash());

// Passport Configuration
app.use(expressSession({
    secret: "Hi hello what is up? Ceiling",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// for login forms POST route
// create new LocalStrategy note: var LocalStrategy = require("passport-local");
// using User.authenticate method coming from
// userModel.js and userSchema.plugin(passportLocalMongoose)
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); // serialize and deserialize are methods from passport-local-mongoose
passport.deserializeUser(User.deserializeUser()); 

// to include currentUser variable into every route/template
app.use(function(req, res, next) {
    res.locals.currentUser = req.user; // accessible by home.ejs
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    
    next(); // don't forget to put next()!!! Always comes last
});

// require route js files
var indexRoutes = require("./routes/index");
var todoRoutes = require("./routes/todo");





// app.use to use route js files
// reduce duplication in route js files by naming directory in app.use

// Routes
app.use("/", indexRoutes);
app.use("/todo", todoRoutes);

// Remove todos and users
// var seedDB = require("./seeds.js");
// seedDB();



// where environment is run
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("todo app started");
})