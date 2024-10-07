// controllers/hoots.js
const express = require('express')
const router = express.Router()
const Hoot = require('../models/hoot')



router.post('/', async function(req, res){
	console.log(req.body, " <- this in contents of the form")
	console.log(req.user, " <- req.user from the jwt")
    
    try {
        req.body.author = req.user._id;
        const hoot = await Hoot.create(req.body);
        hoot._doc.author = req.user;
        res.status(201).json(hoot);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})



router.get('/', async (req, res) => {
    try {
        const hoots = await Hoot.find({}).populate('author');
        res.status(200).json(hoots);
    } catch (error) {
        res.status(500).json(error);
    }
  });


router.get('/:id', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.id).populate('author');

        res.status(200).json(hoot);
    } catch (error) {
        res.status(500).json(error);
    }
});


router.delete('/:id', async (req, res) => {
    try{
        const hoot = await Hoot.findById(req.params.id);
        if (!hoot.author.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }
        await Hoot.findByIdAndDelete(req.params.id);
        res.status(200).json({message: 'Hoot deleted successfully'});

    }  catch (error) {
        res.status(500).json(error);
    }
});


router.put('/:id', async (req, res) => {
    try {
        // Find the hoot:
            const hoot = await Hoot.findById(req.params.id);
        
            // Check permissions:
            if (!hoot.author.equals(req.user._id)) {
                return res.status(403).send("You're not allowed to do that!");
            }

            // const userHoot = await Hoot.findOne({author: req.user._id, _id: req.params.id});

            // if (!userHoot) {
            //     return res.status(403).send("You're not allowed to");
            // }

            // Update hoot:
            const updatedHoot = await Hoot.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
        
            // Append req.user to the author property:
            updatedHoot._doc.author = req.user;
    
            // Issue JSON response:
            res.status(200).json(updatedHoot);
      } catch (error) {
            res.status(500).json({Message: error.message});
    }
});


router.post('/:id/comments', async (req, res) => {
    console.log(req.body, " <- this is the comment")
    console.log(req.user, " <- this is the hoot id")
    try {
        req.body.author = req.user._id;
        const hoot = await Hoot.findById(req.params.id);
        hoot.comments.push(req.body);
        await hoot.save();
    
        // Find the newly created comment:
        const newComment = hoot.comments[hoot.comments.length - 1];
    
        newComment._doc.author = req.user;
    
        // Respond with the newComment:
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router