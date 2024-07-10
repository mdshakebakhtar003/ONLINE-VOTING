// routes/home.js
const express = require("express");
const router = express.Router();
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const User = require('../models/user');

router.get("/", function (req, res) {
  let error = req.flash("error");
  let success = req.flash("success");
  // Get any error flashes
    res.render('index', { error,success });
});

router.get("/pageuser", jwtAuthMiddleware, function (req, res) {
  // You need to set error here as well
  let error = req.flash("error");
  let success = req.flash("success");
  // Get any error flashes
    res.render('pageuser', { error,success });
});

router.get("/pageadmin", jwtAuthMiddleware, function (req, res) {
  let error = req.flash("error");
  let success = req.flash("success");
  // Get any error flashes
    res.render('pageadmin', { error,success });
  
  });

module.exports = router;