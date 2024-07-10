const jwt = require('jsonwebtoken');
const userModel=require('./models/user');
const jwtAuthMiddleware =async (req, res, next) => {

 if (!req.cookies.token) {
    req.flash("error", "cookie not found ");
    return res.redirect("/");
  }

  try {
    let decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      let user=await userModel.findById(decoded.id);
    req.user = user;
    next();
  } catch (err) {
    req.flash("error", "you need to login first");
    res.redirect("/");
  }

}
// Function to generate JWT token
const generateToken = (userData) => {
    // Generate a new JWT token using user data
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: 30000});
}

module.exports = {jwtAuthMiddleware, generateToken};
