const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const Candidate = require('../models/candidate');


const checkAdminRole = async (userID) => {
   try{
        const user = await User.findById(userID);
        if(user.role === 'admin'){
            return true;
        }
   }catch(err){
        return false;
   }
}

// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) =>{
    try{
        if(!(await checkAdminRole(req.user.id))){
            req.flash("error","user does not have admin role"); 
              res.redirect("/pageadmin");
            
        }
           // return res.status(403).json({message: 'user does not have admin role'});

        const data = req.body // Assuming the request body contains the candidate data

        // Create a new User document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new user to the database
        const response = await newCandidate.save();
        console.log('data saved');
        req.flash("success","candidate added successfully"); 
          res.redirect("/pageadmin");
        //res.status(200).json({response: response});
    }
    catch(err){
        req.flash("error","Internal server error"); 
          res.redirect("/pageadmin");
    }
})

router.post('/update', jwtAuthMiddleware, async (req, res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            req.flash("error","user does not have admin role"); 
              res.redirect("/pageadmin");
        }
          //  return res.status(403).json({message: 'user does not have admin role'});
        
        const candidateID = req.body._id; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the person

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {

            req.flash("error","Candidate not found"); 
              res.redirect("/pageadmin");
            //return res.status(404).json({ error: 'Candidate not found' });
        }
        req.flash("success","candidate data updated"); 
          res.redirect("/pageadmin");
        //console.log('candidate data updated');
       // res.status(200).json(response);
    }catch(err){
        req.flash("error","Internal Server Error"); 
          res.redirect("/pageadmin");
        //console.log(err);
       // res.status(500).json({error: 'Internal Server Error'});
    }
})

router.post('/delete', jwtAuthMiddleware, async (req, res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            req.flash("error","user does not have admin role"); 
              res.redirect("/pageadmin");
        }
            //return res.status(403).json({message: 'user does not have admin role'});
        
              const candidateID = req.body._id; // Extract the id from the URL parameter

        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        req.flash("success","candidate deleted"); 
          res.redirect("/pageadmin");
        //console.log('candidate deleted');
        //res.status(200).json(response);
    }catch(err){
        req.flash("error","Internal Server Error"); 
          res.redirect("/pageadmin");
        //console.log(err);
       // res.status(500).json({error: 'Internal Server Error'});
    }
})

// let's start voting
// ... other imports ...

 // Assuming you have a router

// Vote Route
router.post('/vote', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.body._id; // Get candidateID from the form
    const userId = req.user.id; 

    try {
        // Find the Candidate document
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            req.flash("error","Candidate not found"); 
              res.redirect("/pageuser");
            //return res.status(404).json({ message: 'Candidate not found' });
        }

        // Find the User document
        const user = await User.findById(userId);
        if (!user) {
            req.flash("error","User not found"); 
              res.redirect("/pageuser");
            //return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is admin or has already voted
        if (user.role === 'admin') {
            req.flash("error","Admin is not allowed to vote"); 
              res.redirect("/pageuser");
           // return res.status(403).json({ message: 'Admin is not allowed to vote' });
        }
        if (user.isVoted) {
            //req.flash("error","You have already voted"); 
            //  res.redirect("/pageuser");
           return res.status(400).json({ message: 'You have already voted' });
        }

        // Record the vote
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        // Update the User document
        user.isVoted = true;
        await user.save();
        req.flash("success","Vote recorded successfully"); 
          res.redirect("/pageuser");
        //return res.status(200).json({ message: 'Vote recorded successfully' });

    } catch (err) {
        req.flash("error","Internal Server Error"); 
          res.redirect("/pageuser");
       // console.log(err);
       // return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ... other routes ...

// vote count 
router.get('/votecount', async (req, res) => {
    try{
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount: 'desc'});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return {
                party: data.party,
                count: data.voteCount,
               // id:data._id
            }
        });
        res.render("votecounter", { voteRecord });
        //return res.status(200).json(voteRecord);
    }catch(err){
        req.flash("error","Internal Server Error"); 
          res.redirect("/pageadmin");
        //console.log(err);
        //res.status(500).json({error: 'Internal Server Error'});
    }
});

// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party _id');

        // Return the list of candidates
        res.render("candidatesp", { candidates });
    } catch (err) {
        req.flash("error","Internal Server Error"); 
          res.redirect("/pageadmin");
        //console.error(err);
        //res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
