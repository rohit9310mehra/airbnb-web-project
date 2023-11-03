const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {

    const all_listings = await Listing.find({});

    res.render("listings/index.ejs", { all_listings });
};


module.exports.renderNewFormListing = (req, res) => {

    res.render("listings/addlistings.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    //populate return all related data.
    const Details = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },

        })
        .populate("owner");
    if (!Details) {
        req.flash("error", "Listing you requested for does not exit!");
        res.redirect("/listings")
    }
    res.render("listings/show.ejs", { Details });
};

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        // query: req.body.Details.location,
        query: req.body.listing.location,
        limit: 1
      }).send();

    //   console.log(response.body.features[0].geometry);
    //   res.send("done");
    let url = req.file.path;
    let filename = req.file.filename;

    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = { url, filename };

    newlisting.geometry = response.body.features[0].geometry;
    await newlisting.save();
 

    req.flash("success", "New Listing created!");
    res.redirect("/listings");


};

module.exports.editFormListing = async (req, res) => {
    let { id } = req.params;
    let Details = await Listing.findById(id);
    if (!Details) {
        req.flash("error", "listing you requested for does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl = Details.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_30,w_25");
    res.render("listings/edit.ejs", { Details, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {

    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file != "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyed = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");

};