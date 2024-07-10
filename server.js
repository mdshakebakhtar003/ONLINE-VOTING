const express = require('express')
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const flash = require("connect-flash");
const session = require('express-session'); // Import the session middleware
const db = require('./db');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: false }));

app.use(express.json());
app.use(cookieParser());

// Configure the session middleware
app.use(session({
  secret: 'guud', // Replace with a strong secret key
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
// Initialize the flash middleware
app.use(flash());




// Import the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const indexRoutes = require('./routes/home');
// Use the routers
app.use('/', indexRoutes);
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);


app.listen(PORT, ()=>{
    console.log('listening on port 3000');
})
