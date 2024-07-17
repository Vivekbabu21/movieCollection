const login = require('../middleware/login')
// const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _= require('lodash');
const {User, validate} = require('../models/user');
const {Movie} = require('../models/movie');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
router.use(login);

router.get('/', async (req, res) => {
    const users = await User.find().sort('name').select('name -_id');
    // res.send(users);
    res.render('register')
  });

  router.get('/me',login,async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    const moviesAdded = await Movie.aggregate([
      {
        $match: {
          user: user.name
        }
      },
      {
        $group:{
          _id:null,
          count:{$sum:1}
        }
      }
    ])



    // res.send(user);
    res.render('currentUser',{user,moviesAdded});
  });

  

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({email:req.body.email});
  if(user) return res.status(400).send('User already registered');

   user = new User({ 
    name: req.body.name,
    email:req.body.email,
    password:req.body.password
  });
  const salt =await bcrypt.genSalt(10);
  user.password=await bcrypt.hash(user.password,salt);
  await user.save();

//   const token = user.generateAuthToken();
//   res.send(_.pick(user,['name','email']));
  res.redirect('/api/login');
  
  
});

module.exports = router;