const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const nodemailer =require('nodemailer');
// app.set('view engine','ejs')

// app.use(express.json());

const {User} = require('../models/user');
// const logger = require('../logger');

router.get('/',(req,res)=>{
    res.render('forgetpassword');
})

router.post('/',async(req,res)=>{
    const email = req.body.email;
    const user=await User.findOne({email});
    if(!user){
       return res.send('User not registered');
    }
    const SECRET ='secret';


    const secret= SECRET+user.password;
    const token = jwt.sign({_id:user._id,email:user.email},secret);
    // res.send(token);
    const link = `http://localhost:3000/resetpassword/${user._id}/${token}`;
    const resetlink=`<a href="${link}">${link}</a>`;

    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "eaf62b87633cca",
          pass: "86947555052ab6"
        }
      });
    const mailOptions = {
        from: 'your_email@gmail.com', 
        to: user.email,
        subject: 'Password Reset Link',
        html: `<p>You requested a password reset. Click the link below to reset your password:</p>${resetlink}`
    };
    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error sending email');
        }
        res.send('Password reset link sent to your email');

    });    // console.log(link);
    // res.send(resetlink);
})

module.exports= router;