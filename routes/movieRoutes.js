const {Movie,validate} = require('../models/movie'); 
const {User} = require('../models/user');
const mongoose = require('mongoose');
const Joi = require('joi');
const path = require('path');
const logActivity = require('../middleware/activityLogger');





const express = require('express');
const methodOverride = require('method-override');

const login = require('../middleware/login');
const router = express.Router();

router.use(methodOverride('_method'));
router.use(login);

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

const upload = multer({ storage: storage  });

router.use('/uploads', express.static(path.join(__dirname,'uploads')));


router.get('/add',(req,res)=>{
    res.render('add');
});

router.get('/update/:id',async(req,res)=>{
    const movie = await Movie.findById(req.params.id);
    res.render('update',{movie});
})

router.get('/',async (req, res) => {
    let query = {};

if (req.query.title) {
    query.title = new RegExp(req.query.title, 'i');
}
if (req.query.genre) {
    query.genre = new RegExp(req.query.genre, 'i');
}
if (req.query.rating) {
    query.rating = { $gte: req.query.rating };
}
if (req.query.director) {
    query.director = new RegExp(req.query.director, 'i');
}
if (req.query.user) {
    query.user = new RegExp(req.query.user, 'i');
}


// const user = await User.findById(req.user._id);

    
   

    try {
        // const movies = await Movie.find(query).sort('title');
        // const user = await User.findById(req.body.userId);
        const movies = await Movie.find(query);

        movies.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));

        // res.send(movies);
          res.render('movies',{movies});
    } catch (error) {
        res.status(500).send('Error fetching movies');
        console.log(error);
    }
})


router.post('/',upload.single('image'),logActivity('Added a Movie'),async (req, res) => {

    // const { error } = validateMovie(req.body); 
    const { error } = validateMovie({
        title: req.body.title,
        genre: req.body.genre,
        director: req.body.director,
        rating: req.body.rating,
        // imageUrl: `/uploads/${req.file.filename}`,
      });
    if (error) return res.status(400).send(error.details[0].message);


  
    // const user = await User.findById(req.body.userId);
    const user = await User.findById(req.user._id);

    // const user = req.user; 

    if (!user) return res.status(400).send('Invalid user.');
  
    const addData = new Movie({ 
      title: req.body.title,
      genre: req.body.genre,
      director:req.body.director,
      rating: req.body.rating,
      user: user.name,
    //   imageUrl: `/uploads/${req.file.filename}`
      
 });
 if (req.file) {
    addData.imageUrl = `/uploads/${req.file.originalname}`;
}
    const movie = await addData.save();
    
    // res.send(movie);
    res.redirect('/api/movies');
  });

router.put('/update/:id',upload.single('image'),logActivity('Updated a Movie'),async (req, res) => {
    
    const { error } = validateMovie({
        title: req.body.title,
        genre: req.body.genre,
        director: req.body.director,
        rating: req.body.rating,
         }); 
      
    if (error) return res.status(400).send(error.details[0].message);


    const moviename =await Movie.findById(req.params.id);

     const user = await User.findById(req.user._id);
     if (!user) return res.status(400).send('Invalid user.');

    if(moviename.user!==user.name && !req.user.isAdmin){
        return res.status(403).send('You cannot Update...');
    }
   
  
    // const movie = await Movie.findByIdAndUpdate(req.params.id,
    //   {                                       
    //     title: req.body.title,
    //   genre: req.body.genre,
    //   director:req.body.director,
    //   rating: req.body.rating,
    //   imageUrl: `/uploads/${req.file.originalname}`
    // //   user:user.name
    //  }, { new: true });
  
    const updateData = {
        title: req.body.title,
        genre: req.body.genre,
        director: req.body.director,
        rating: req.body.rating,
    };

    if (req.file) {
        updateData.imageUrl = `/uploads/${req.file.originalname}`;
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, updateData, { new: true });


    if (!movie) return res.status(404).send('The movie with the given ID was not found.');
    await movie.save();
    // res.send(movie);
    res.redirect('/api/movies');
  });

router.delete('/:id',logActivity('Deleted a Movie'), async (req, res) => {
    try{
        const movie = await Movie.findById(req.params.id);

    if (!movie) return res.status(404).send('The movie with the given ID was not found.');

    const movieUser = movie.user;


    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).send('Invalid user.');

    const currentUser = user.name;

    if(movieUser!== currentUser && !req.user.isAdmin){
        return res.status(403).send('You cannot Delete...');
    }
        await Movie.findByIdAndDelete(req.params.id);
        // res.send(movie);
        res.redirect('/api/movies');

    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
    
    
   } );

 
router.get('/genres', async (req, res) => {
    try {
        const genres = await Movie.distinct('genre');
        // res.send(genres);
        res.render('genres',{genres});
    } catch (error) {
        res.status(500).send('Error fetching genres');
    }
});

router.get('/titles', async (req, res) => {
    try {
        const titles = await Movie.distinct('title');
        // res.send(titles);
        res.render('moviesList',{titles});

    } catch (error) {
        res.status(500).send('Error fetching titles');
    }
});

router.get('/directors', async (req, res) => {
    try {
        const directors = await Movie.distinct('director');
        // res.send(directors);
        res.render('directors',{directors});

    } catch (error) {
        res.status(500).send('Error fetching directors');
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await Movie.distinct('user');
        res.send(users);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
});
router.get('/usernames', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
});


router.get('/:id', async (req, res) => {
    const movie = await Movie.findById(req.params.id);
  
    if (!movie) return res.status(404).send('The movie with the given ID was not found.');
  
    res.send(movie);
  });

  function validateMovie(movie) {
    const schema = Joi.object({
      title: Joi.string().min(2).max(50).required(),
      genre:Joi.string(),
      director:Joi.string(),
      rating: Joi.number(),
      imageUrl:Joi.string().optional()
       });
  
    return schema.validate(movie);
  }
  

module.exports=router;