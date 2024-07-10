
const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

// POST route to add a person
router.post('/signup', async (req, res) =>{
    try{
        const data = req.body // Assuming the request body contains the User data

        // Check if there is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            req.flash("error", "Admin user already exists");
              return res.redirect("/");
            //return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Validate Aadhar Card Number must have exactly 12 digit
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            req.flash("error", "Aadhar Card Number must be exactly 12 digits");
              return res.redirect("/");
            //return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }

        // Check if a user with the same Aadhar Card Number already exists
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            req.flash("error", "User with the same Aadhar Card Number already exists");
              return res.redirect("/");
           // return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
        }

        // Create a new User document using the Mongoose model
        const newUser = new User(data);

        // Save the new user to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }
       // console.log(JSON.stringify(payload));
        const token = generateToken(payload);
          res.cookie("token", token);
         req.flash('success', 'You have successfully registered!'); 
          res.redirect("/");
       // res.status(200).json({response: response, token: token});
    }
    catch(err){

        req.flash("error", "Internal server error");
          return res.redirect("/");
       // console.log(err);
        //res.status(500).json({error: 'Internal Server Error'});
    }
})

// Login Route
router.post('/login', async(req, res) => {
    try{
        // Extract aadharCardNumber and password from request body
        const {aadharCardNumber, password} = req.body;

        // Check if aadharCardNumber or password is missing
        if (!aadharCardNumber || !password) {
            req.flash("error", "Aadhar Card Number and password are required");
              return res.redirect("/");
            //return res.status(400).json({ error: 'Aadhar Card Number and password are required' });
        }

        // Find the user by aadharCardNumber
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            req.flash("error", "Invalid Aadhar Card Number or Password");
              return res.redirect("/");
           // return res.status(401).json({error: 'Invalid Aadhar Card Number or Password'});
        }

        // generate Token 
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);
         res.cookie("token", token);
        
        // resturn token as response
        if(user.role ==='admin') return res.redirect("/pageadmin");
        else return res.redirect("/pageuser");
       // res.json({token})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
          res.render('userp', { user: [user] });
        //res.status(200).json({user});
    }catch(err){
        console.error(err);
        req.flash("error", "Internal server error");
          return res.redirect("/pageuser");
    }
})

router.post('/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extract the id from the token
        const { currentPassword, newPassword } = req.body; // Extract current and new passwords from request body

        // Check if currentPassword and newPassword are present in the request body
        if (!currentPassword || !newPassword) {
            req.flash("error", "Both currentPassword and newPassword are required");
              return res.redirect("/pageuser");
           
        }

        // Find the user by userID
        const user = await User.findById(userId);

        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(currentPassword))) {
            req.flash("error", "Invalid current password");
              return res.redirect("/pageuser");
          
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();
        req.flash("success", "password updated");
          return res.redirect("/pageuser");
      
    } catch (err) {
        console.error(err);
        req.flash("error", "Internal server error");
          return res.redirect("/pageuser");
    }
});

module.exports = router;
