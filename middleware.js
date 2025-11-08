const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema,reviewSchema } = require("./schema.js");
const Review= require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "Before you use the app You must Login");
    return res.redirect("/login");
  }
  next()
};


module.exports.saveRedirectUrl = ((req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next();
})
module.exports.isOwner = async(req,res,next) =>{
  let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","Listing not found!");
      return res.redirect("/listings")
    }

    if(!listing.owner.equals(req.user._id)){
      req.flash("error","You are not the Owner of this listing ")
      return res.redirect(`/listings/${id}`)
    }
    next();
};

// validateListing
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
// validateReview
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
 module.exports.isReviewAuthor = async(req,res,next) =>{
  let { id,reviewId } = req.params;
    const review = await Review.findById(reviewId)
    if(!review){
      req.flash("error","review not found")
      return res.redirect(`/listings/${id}`)
    }
    if(!review.author.equals(req.user._id)){
      req.flash("error","You are not the author of this review");
      return res.redirect(`/listing/${id}`)
    }
    next();
};