const Joi = require('joi');
const mongoose = require('mongoose');
const {userSchema} = require('./user');
const Movie = mongoose.model('Movie', new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true, 
    minlength: 2,
    maxlength: 255
  },
  genre: { 
    type: String,  
    required: true
  },
  director:{
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min:0,
    max:10
  },
  user: {
    type: String,
    required: true
}
//  imagePath: String

  
}));

function validateMovie(movie) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(50).required(),
    genre:Joi.string(),
    director:Joi.string(),
    rating:Joi.number(),
    userId: Joi.string().required(),
     });

  return schema.validate(movie);
}

exports.Movie = Movie; 
exports.validate = validateMovie;