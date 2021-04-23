const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async (req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await camp.save();
    await review.save();
    req.flash('success', 'Successfully created a new Review!');
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteReview = async(req,res)=>{
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a Review!');
    res.redirect(`/campgrounds/${id}`);
}