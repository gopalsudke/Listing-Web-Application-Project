const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js")
const listingSchema = new Schema ({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image: {
  filename: {
    type: String,
    default: "listingimage",
  },
  url: {
    type: String,
    default: "https://unsplash.com/photos/surfer-carries-board-on-head-as-sun-sets-t2AP9JEIm0k",
  }
},
    
    price:Number,
    location:String,
    country:String,
    reviews : [
      {
        type:Schema.Types.ObjectId,
        ref:"Review",
      }
    ]
})

listingSchema.post("findOneAndDelete",async (listing) => { 
  if(listing) {
     let res =   await Review.deleteMany({_id : {$in : listing.reviews}});
     console.log(res);
     
  }
});
 

const Listing  = mongoose.model("Listing",listingSchema);
module.exports = Listing;