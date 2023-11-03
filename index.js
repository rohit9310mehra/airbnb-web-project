if(process.env.NODE_ENV != "production"){
    require('dotenv').config();

} 



const express = require("express");
const app = express();
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
//methodOverride are use to send the put/delete request
const methodOverride = require('method-override');
app.use(methodOverride("_method"));
//require the ejs-mate for template 
const ejsmade = require("ejs-mate");
app.engine('ejs', ejsmade);
const ExpressError = require("./utils/ExpressError.js");
app.use(express.static(path.join(__dirname, "/public")));
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")



// //create a database connection 
const mongoose = require("mongoose");
// MONGO_URL = "mongodb://127.0.0.1:27017/home";
const dbUrl = process.env.ATLASDB_URL;
async function main() {
    await mongoose.connect(dbUrl);
}
main().then(() => {
    console.log("connect db");
}).catch(err => {
    console.log("err in database");
});

const store =  MongoStore.create({
    mongoUrl : dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600,

});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires : Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};

//learn the website
app.use(session(sessionOptions));
app.use(flash());

//login and signup 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// Generates a function that is used by Passport to serialize users into the session
//Generates a function that is used by Passport to deserialize users into the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// work in website such as add /delete the post
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})



// app.get("/", (req, res) => {
//     res.send("hi i am root");
// });



app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/",userRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// error handling middleware...
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});