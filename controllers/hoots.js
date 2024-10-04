const express = require('express')
const router = express.Router()
const HootModel = require('../models/hoot')



router.post('/', async function(req, res){
	console.log(req.body, " <- this in contents of the form")
	console.log(req.user, " <- req.user from the jwt")



	res.json({message: "Post"})
})

module.exports = router