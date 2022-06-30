const express = require('express');
const router = express.Router();

// create a response for the homepage
router.get('/', (req, res , next) => {
    res.render('home' , null)
})


module.exports = router;