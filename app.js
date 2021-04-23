if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const method = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/expressErrors');

const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');

const mongoSanitize = require('express-mongo-sanitize');

///////----- SESSIONS---------
const session = require('express-session');

//////////-------MONGODB
const dbUrl = 'mongodb://localhost:27017/yelp-camp';
// process.env.DB_URL
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console,"Connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const sessionConfig = {
    name: 'yelpCamp',
    secret: 'thisissecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

////////-------FLASH----------
const flash = require('connect-flash');
app.use(flash());
app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
/////////-----ROUTES
const campgrounds = require('./routes/campground')
const review = require('./routes/review')
const user = require('./routes/user')



app.engine('ejs', ejsMate)

app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(method('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());


/////////-------using routes
app.use('/', user);
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', review);


app.get('/', (req,res) => {
    res.render('home.ejs');
})

app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not Found', 404));
})

app.use((err,req,res,next)=>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something Went Wrong!!';
    res.status(statusCode).render('error.ejs', {err});
})

app.listen(3000, () => {
    console.log("Server at 3000!");
})