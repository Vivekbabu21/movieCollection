const login = require('../middleware/login');
const express = require('express');
const router = express.Router();
const {User} = require('../models/user');
const {Movie} = require('../models/movie');


const Activity = require('../models/activity');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));
router.use(login);


router.get('/activitylogs',login,async (req, res) => {
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
  res.render('activitylog',{user,moviesAdded,activities});
});

router.get('/user/:userId', async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    // res.render('activities', { activities });
    res.send(activities);
  } catch (error) {
    res.status(500).send('Error fetching activities');
  }
});

router.delete('/:userId', async (req, res) => {
  try {
    const activities = await Activity.deleteMany({ userId: req.params.userId }).sort({ timestamp: -1 });
    // res.render('activities', { activities });
    res.redirect('/api/users/me');
  } catch (error) {
    res.status(500).send('Error deleting activities');
  }
});




module.exports = router;
