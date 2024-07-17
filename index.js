const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes.js');
const movieRoutes = require('./routes/movieRoutes.js');
const loginRoutes=require('./routes/loginRoutes.js');
const methodOverride = require('method-override');
const login = require('./middleware/login.js');
const forgetpassword=require('./routes/forgetpassword.js');
const resetpassword=require('./routes/resetpassword.js');
const logout= require('./routes/logout.js');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage  })
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


app.set('view engine', 'ejs');


mongoose.connect('mongodb://localhost/movieCollection')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));



app.use('/api/users', userRoutes);
app.use('/api/movies',login, movieRoutes);
app.use('/api/login',loginRoutes);
app.use('/api/forgetpassword',forgetpassword);
app.use('/resetpassword',resetpassword);
app.use('/logout',logout);
app.use(methodOverride('_method'));
app.use(login);

// app.post('/form',upload.single('file'),(req,res)=>{
//   res.send(req.file);
// })





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
