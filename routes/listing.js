const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/asyncWrap.js");
const { validationsListing } = require("../checkMiddleware.js");
const Listing = require('../models/listing.js');
const { isLoggedIn, isowner } = require("../checkMiddleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
    .route("/")
    //index route
    .get(wrapAsync(listingController.index))
    // add route
    .post(isLoggedIn, upload.single("listing[image]"), wrapAsync(listingController.createListing));




//new route 

router.get("/new", isLoggedIn, listingController.renderNewFormListing);

//show route

router.get("/:id", wrapAsync(listingController.showListing));


// edit route

router.get("/:id/edit", isLoggedIn, isowner, wrapAsync(listingController.editFormListing));

//update route

router.put("/:id", isLoggedIn, isowner, upload.single("listing[image]"), wrapAsync(listingController.updateListing));


// DELETE route

router.delete("/:id", isLoggedIn, isowner, wrapAsync(listingController.destroyed));

module.exports = router;