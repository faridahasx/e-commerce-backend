const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passpost = require('passport');
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require('dotenv').config();
const MongoStore = require('connect-mongo');
const connectDB = require("./config/database");
const passportSetup = require('./middleware/passport.js')
const auth = require('./routes/auth');
const user = require('./routes/user');
const product = require('./routes/product');
const imgUpload = require('./routes/imgUpload');
const cartItem = require('./routes/cartItem');

const PORT = process.env.PORT || 3000 ;
const NODE_ENV = process.env.NODE_ENV
const COOKIE_SECRET = process.env.COOKIE_SECRET


// Initialize the App
const app = express();

// Connect to MongoDB
connectDB();

// Logging
if (NODE_ENV === 'development') {
    app.use(morgan('dev'))
};

// Parse incoming JSON requests and put parsed data in req.body
app.use(express.json());

//Enable using cookies
app.use(cookieParser());

app.use(session({
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },                          
    store: MongoStore.create({
        mongoUrl:process.env.MONGO_URI
    })
}));

// Initialize passport
app.use(passpost.initialize());

// CORS options
app.use(cors({
    origin:[
        'http://127.0.0.1:5173/'
    ],
    methods: "GET, POST, PUT, DELETE, PATCH",
    credentials:true
}));

// Routes
app.use('/api/auth', auth);
app.use('/api/user', user);
app.use('/api/products', product);
app.use('/api/image', imgUpload);
app.use('/api/cart', cartItem);

// Listen 
app.listen(PORT, ()=>{ 
    console.log(`SERVER IS RUNNING ON PORT: ${PORT}`)
});