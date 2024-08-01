const login = require('../middleware/login')
// const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _= require('lodash');
const {User, validate} = require('../models/user');

const {Movie} = require('../models/movie');
const mongoose = require('mongoose');
const Joi = require('joi');

const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');
const Activity = require('../models/activity');



router.use(methodOverride('_method'));
router.use(login);




router.get('/editUsername', login, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.render('updateUser', { user });
});

router.get('/', async (req, res) => {
    const users = await User.find().sort('name').select('name -_id');
    // res.send(users);
    res.render('register')
  });

  router.get('/me',login,async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    const activities = await Activity.find({userId:req.user._id}).sort({ timestamp: -1 });
    // console.log(activities);


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
    res.render('currentUser',{user,moviesAdded,activities});
  });

  

router.post('/', async (req, res) => {
  const { error } = validateUser(req.body); 
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

router.put('/:_id', login, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(404).send('User not found.');

    const oldUserName = user.name;

    user.name = req.body.name;

    await user.save();

    await Movie.updateMany({ user: oldUserName }, { user: req.body.name });

    res.redirect('/api/users/me');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  });

  return schema.validate(user);
}

function validateUsername(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required()
  });

  return schema.validate(user);
}

module.exports = router;