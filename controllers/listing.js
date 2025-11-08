const Listing = require("../models/listing");

// INDEX - Show all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

// NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

// SHOW - Single listing
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show", { listing });
};

// CREATE - New listing
module.exports.createListing = async (req, res, next) => {
  // Remove rating if somehow added
  if (req.body.listing && req.body.listing.rating) delete req.body.listing.rating;

  // console.log(req.file); // check uploaded file
  let url = req.file.path;
  let filename = req.file.filename;
  
  const newListing = new Listing(req.body.listing || {});
  newListing.owner = req.user._id;
  newListing.image = {url,filename};

   if (req.file) {
    newListing.image = {
      url: req.file.path,       // Cloudinary URL
      filename: req.file.filename,
    };
  }
  // if (req.file) {
  //   // File uploaded
  //   newListing.image = {
  //     filename: req.file.filename,
  //     url: req.file.path,
  //   };
  // } else {
  //   // Default image
  //   newListing.image = {
  //     filename: "listingimage",
  //     url: "https://unsplash.com/photos/random-house-image",
  //   };
  // }

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect(`/listings`);
  //  ${newListing._id}
};

// EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listings/edit", { listing });
};

// UPDATE
module.exports.updateForm = async (req, res) => {
  const { id } = req.params;
  console.log(req.file);
  
  // Remove rating if somehow added
  if (req.body.listing && req.body.listing.rating) delete req.body.listing.rating;

  const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing || {}, { new: true });

  // If file uploaded, update image
  if (req.file) {
    updatedListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await updatedListing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// DELETE
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  // No need to touch rating here → prevent undefined error
  const deletedListing = await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
