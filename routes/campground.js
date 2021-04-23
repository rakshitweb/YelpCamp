const express = require('express');
const catchAsync = require('../utils/catchAsync');
const campground = require('../controllers/campgrounds');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');
const router = express.Router({mergeParams: true});

const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});

///// ----- TO SHOW ALL CAMPGROUNDS IN THE DATABASE -----
///// ----- TO CREATE A NEW CAMPGROUND IN THE DATABASE -----
router.route('/')
    .get(catchAsync(campground.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campground.createNewCampground))
    
///// ----- TO GO TO NEW CAMPGROUND CREATION EJS FILE -----
router.get('/new', isLoggedIn, campground.renderNewForm)

////// ----- CUSTOMIZED OPTION TO SEARCH AN SPECIFIC CAMPGROUND -----
router.post('/search', catchAsync(campground.searchCampground))

///// ----- TO SHOW A SPECIFIC CAMPGROUND PRESENT IN THE DATABASE -----
////// ----- TO UPDATE A SPECIFIC CAMPGROUND PRESENT IN THE DATABASE -----
///// ----- TO DELETE A SPECIFIC CAMPGROUND FROM THE DATABASE ------
router.route('/:id')
    .get(catchAsync(campground.showSpecificCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campground.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campground.deleteCampground))

////// ----- TO PLACE A GET REQUEST FOR EDITING OF A CAMPGROUND -----
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campground.renderEditForm))

module.exports = router;