const express = require("express");
const asyncWrap = require("../utils/asyncWrap");
const router = express.Router();

const passport = require("passport");
const { saveRedirectUrl } = require("../checkMiddleware");
const usersController = require("../controllers/users.js");

//signup form route
router.get("/signup",usersController.signup);

//update singup route
router.post("/signup", asyncWrap(usersController.updateSignup));

//login route
router.get("/login",usersController.login);

//update login route
router.post("/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login", failureFlash: true
    }),
    usersController.updateLogin);

//logout route
router.get("/logout", usersController.logout);

module.exports = router;