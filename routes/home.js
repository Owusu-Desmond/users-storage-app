const express = require('express');
const router = express.Router();

// create a response for the homepage
router.get('/', (req, res , next) => {
    res.send("This is the home route!");
})


module.exports = router;