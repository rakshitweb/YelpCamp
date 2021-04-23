const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapboxToken});

const titleSort = (arr, order)=>{
    if(order == 'asec'){
    for(let i=0;i<arr.length-1;i++){
        for(j=0;j<arr.length-i-1;j++){
            if(arr[j].title>arr[j+1].title){
                temp = arr[j]
                arr[j]=arr[j+1]
                arr[j+1]=temp
            }
        }
    }
    } else if(order == 'desc'){
        for(let i=0;i<arr.length-1;i++){
            for(j=0;j<arr.length-i-1;j++){
                if(arr[j].title<arr[j+1].title){
                    temp = arr[j]
                    arr[j]=arr[j+1]
                    arr[j+1]=temp
                }
            }
        }   
    }
    return arr;
}

module.exports.index = async (req,res,next) => {
    const sortType = req.query.titleSort
    let campgrounds = await Campground.find({});
    let sortCampgrounds = campgrounds;
    sortCampgrounds = titleSort(campgrounds,sortType)
    res.render('campgrounds/index.ejs', {campgrounds: sortCampgrounds, typeSort: sortType, type: "title"});
}

module.exports.renderNewForm = (req,res) => {
    res.render('campgrounds/new.ejs');
}

module.exports.createNewCampground = async (req,res,next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully created a CampGround!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.searchCampground = async (req,res) => {
    const {searchVal} = req.body;
    const campground = await Campground.find({title: searchVal});
    if(!campground.length) {
        req.flash('error', 'Cannot find the Searched Campground..');
        res.redirect('/campgrounds');
    }
    req.flash('success', 'Found Your Comapground!');
    res.redirect(`/campgrounds/${campground[0]._id}`);
}

module.exports.showSpecificCampground = async (req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id)
                                        .populate({
                                            path: 'reviews', 
                                            populate: {
                                                    path: 'author'}
                                            })
                                            .populate('author');
    if(!campground) {
        req.flash('error', 'Cannot find the desired Campground..');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', {campground});
}

module.exports.editCampground = async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true, new: true});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.images.push(...imgs);
    await campground.save(); 
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Successfully updated the CampGround!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.renderEditForm = async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    if(!campground) {
        req.flash('error', 'Cannot find the desired Campground..');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.deleteCampground = async (req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    for(let img of camp.images) {
        await cloudinary.uploader.destroy(img.filename);
    }
    req.flash('success', `Successfully deleted ${camp.title}!`);
    res.redirect('/campgrounds');
}