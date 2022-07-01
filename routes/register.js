const express = require('express');
const router = express.Router();

// create a response for the homepage
router.post('/', (req, res , next) => {
    res.json({
        data: req.body
    })
}) 


module.exports = router;