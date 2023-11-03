//it check the use is login or not.
const Listing = require("./models/listing.js");
const Reviews = require("./models/review.js");

const ExpressError = require("./utils/ExpressError.js");
const {listingschema,reviewSchema} = require("./schema.js");



module.exports.isLoggedIn=(req,res,next)=>{
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in to create listing!");
       return res.redirect("/login");
    }
    next();
}
module.exports.saveRedirectUrl=(req,res,next)=>{

    if ( req.session.redirectUrl) {
        res.locals.redirectUrl =  req.session.redirectUrl;
    }
    next();
};

module.exports.isowner = async(req,res,next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error","you don't have permission to edit");
       return res.redirect(`/listings/${id}`);
    }

    next();
}

module.exports.validationsListing = (req, res, next) => {
    const { error } = listingschema.validate(req.body);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
};
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async(req,res,next)=>{
    let { id ,reviewId } = req.params;
    let review = await Reviews.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error","you are not the author of this review");
       return res.redirect(`/listings/${id}`);
    }
    next();
}