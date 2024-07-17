const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _= require('lodash');
const {User} = require('../models/user');
const {Movie} = require('../models/movie');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
// const login = require('../middleware/login');

router.get('/',async(req,res)=>{
    res.render('login');
})

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({email:req.body.email});
  if(!user) return res.status(400).send('Invali email or password');

  const validPassword =await bcrypt.compare(req.body.password,user.password);
  if(!validPassword) return res.status(400).send('Invali email or password');

//   const token =user.generateAuthToken();
//   res.header('x-token',token).send(_.pick(user,['name','email']));
//   res.header('x-token',token);
//   const movies = await Movie.find().sort('title');
//   res.render('movies',{movies});

const token = user.generateAuthToken();

    res.header('x-token', token);
    res.cookie('x-token',token,{httpOnly:true,maxAge: 24 * 60 * 60 * 1000});
    
    try {
        const movies = await Movie.find().sort('title');

        res.render('movies', { movies });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).send('Internal Server Error');
    }
  
});
function validate(user) {
    const schema = Joi.object({
      email: Joi.string().min(3).max(255).required().email(),
      password: Joi.string().min(3).max(255).required()
    });
  
    return schema.validate(user);
  }

module.exports = router;