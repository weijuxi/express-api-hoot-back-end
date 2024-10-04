const express = require("express");
const router = express.Router();
const HootModel = require("../models/hoot");

router.post("/", async function (req, res) {
  console.log(req.body, " <- this in contents of the form");
  console.log(req.user, " <- req.user from the jwt");
  req.body.author = req.user._id;

  try {
    //
    const hootDoc = await HootModel.create(req.body);
    // if we want to send back the author property with the whole object
    // instead just the userId
    hootDoc._doc.author = req.user;
    res.status(201).json(hootDoc);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async function (req, res) {
  try {
    // .populate, is when you have referenced propetry
    // in this case author (check the model to see the refernce)
    // and it replaces the id with the object that the id references
    const hootDocs = await HootModel.find({}).populate("author");

    res.status(200).json(hootDocs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async function (req, res) {
  try {
    const hootDoc = await HootModel.findById(req.params.id).populate("author");

    res.status(200).json(hootDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async function (req, res) {
  try {
    // Only the user who created the hoot should be able to update it
    // First check to see if the user owns this document
    const hootDoc = await HootModel.findById(req.params.id);

    // .equals is a mongoose method for comparing mongodb id's
    // we can't use the === we need to use the .equals method
    if (!hootDoc.author.equals(req.user._id)) {
      res.status(403).json({
        message: "you're not allowed to delete a hoot",
      });
    }

    const deletedHoot = await HootModel.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Item was successfully deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async function (req, res) {
  try {
    // Only the user who created the hoot should be able to update it
    // First check to see if the user owns this document
    const hootDoc = await HootModel.findById(req.params.id);

    // .equals is a mongoose method for comparing mongodb id's
    // we can't use the === we need to use the .equals method
    if (!hootDoc.author.equals(req.user._id)) {
      res.status(403).json({
        message: "you're not allowed to update a hoot",
      });
    }

    // ANOTHER WAY TO DO THE ABOVE LOGIC
    // const userHootDoc = await HootModel.findOne({author: req.user._id, _id: req.params.id})

    // if(!userHootDoc){
    // 	res.status(403).json({
    // 		message: "you're not allowed to update a hoot",
    // 	  });
    // { new true} is the options that says return the updated hoot document
    const updatedHoot = await HootModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // append the user propety so we don't have to populate
    updatedHoot._doc.author = req.user;

    res.status(200).json(updatedHoot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:hootId/comments", async function (req, res) {

	console.log(req.body)
	console.log(req.user)
  try {
	// assinging the author to req.body, so we have an object that matches
	// the shape of the comment schema!
	req.body.author = req.user._id
	// find the hoot so we can add the comment to the hoot's comments array
	const hootDoc = await HootModel.findById(req.params.hootId)
	// add the comment to the comments array
	hootDoc.comments.push(req.body)
	// tell the deb we added cthe comment to the hoot array
	await hootDoc.save()


	// grab the new comment, which is the last comment in the array
	// const newComment = hootDoc.comments[hootDoc.comments.length -1]
	
	// newComment._doc.author = req.user

	// another way, because we are populating on a document
	await hootDoc.populate('comments.author')

	// up to us what we want to send back
	res.status(201).json(hootDoc)

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
