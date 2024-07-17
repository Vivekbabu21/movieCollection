// const config = require('config');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


async function login(req,res,next){
    // const token = req.header('x-token');
    const token = req.cookies['x-token'];
    if(!token) return res.status(401).send('Access deied.No token provided.');

    try{
        const decoded = jwt.verify(token,'BABU');
        req.user = decoded;    

        

        next();
    }
    catch(ex){
        console.error('failed:',ex.message);
        res.status(400).send('Invalid token');
    }
    
    
}

module.exports = login;