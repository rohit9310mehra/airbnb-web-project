const User = require("../models/user.js")

module.exports.signup = (req, res) => {
    res.render("./users/signup.ejs");
}

module.exports.updateSignup  = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password);
        console.log(registerUser);
        req.login(registerUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", `Welcome to ${username} in Airbnb`);
            res.redirect("/listings");
        })



    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }

}

module.exports.login  = (req, res) => {
    res.render("./users/login.ejs");
}

module.exports.updateLogin = async (req, res) => {
    let { username } = req.body;
    req.flash("success", `Welcome back ${username} in Airbnb`);
    let redirectUrl = res.locals.redirectUrl||"/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);

        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    })
}