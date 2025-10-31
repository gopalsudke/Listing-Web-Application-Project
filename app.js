const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Review = require("./models/review.js");
const listings = require("./routes/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");
// const { listingSchema, reviewSchema } = require("./schema.js");
// const ExpressError = require("./utils/ExpressError.js");
// const Listing = require("./models/lsting.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

main()
  .then(() => {
    console.log("db is connected");
  })
  .catch((err) => {
    console.log(err);
  });

// test listing Route
// app.get("/testListing",async(req,res) =>{
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description : "By the beach",
//         price : 1200,
//         location:"Bitoda teli ,Washim" ,
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("send Successfully")

// });
async function main() {
  await mongoose.connect(MONGO_URL);
}
  

//validateListing
// const validateListing = (req, res, next) => {
//   let { error } = listingSchema.validate(req.body);

//   if (error) {
//     let errMsg = error.details.map((el) => el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   } else {
//     next();
//   }
// };
 
// validateReview
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
 
// root Route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

 app.use("/listings",listings);

// Reviews ka
//Post Review Route
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newRiview = new Review(req.body.review);

    listing.reviews.push(newRiview);

    await newRiview.save();
    await listing.save();
    res.redirect(`/listings/${listing.id}`);
  })
);

// delete Review Route

app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  })
);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!!" } = err;
  res.status(statusCode).render("error.ejs", { err });
  // res.status(statusCode).send(message) ;
});

app.listen(300, () => {
  console.log("server is listening");
});
