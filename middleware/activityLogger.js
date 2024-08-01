const Activity = require('../models/activity');

  function logActivity(action) {
    return async function (req, res, next) {
    if (req.user) {
      try {
        await Activity.create({
          userId: req.user._id,
          action,
          timestamp: new Date()
        });
      } catch (err) {
        console.error('Error logging activity:', err);
      }
    }
    next();
  };
};

module.exports = logActivity;
