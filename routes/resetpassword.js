const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// const nodemailer =require('nodemailer');
// app.set('view engine','ejs')

// app.use(express.json());

const {User} = require('../models/user');

router.get('/:id/:token',async(req,res)=>{
    const _id = req.params.id
    const token = req.params.token;
   

    try{
        const user = await User.findById(_id);
        if (!user) {
            return res.status(400).send('Invalid link or expired');
        }
        const SECRET ='secret';
        const secret= SECRET+user.password;
         const payload = jwt.verify(token,secret);
        res.render('resetpassword');

    }
    catch(ex){
        console.error('failed:',ex.message);
        res.status(400).send('Invalid token');
    }})


router.post('/:_id/:token',async(req,res)=>{
    const _id = req.params._id
    const token = req.params.token;

try{
    const user = await User.findById(_id);
        if (!user) {
            return res.status(400).send('Invalid link or expired');
        }

    const SECRET ='secret';
    const secret= SECRET+user.password;
     const payload = jwt.verify(token,secret);
    // res.render('resetpassword');
    const password = req.body.password;
const password2 = req.body.password2;
if(password!==password2){
    res.send('password does not match..');
}
       const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        
        res.redirect('/api/login');

}
catch(ex){
    console.error('failed:',ex.message);
    res.status(400).send('Invalid token');
}
;
})

module.exports= router;