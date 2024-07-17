const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.clearCookie('x-token', { httpOnly: true });
    res.redirect('/api/login');
});

module.exports = router;
