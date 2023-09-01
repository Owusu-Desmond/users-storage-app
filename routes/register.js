const express = require('express');
const User = require('../models/User');
const router = express.Router();

// create a response for the homepage
router.post('/register', (req, res , next) => {
    User.create(req.body, (err ,user) => {
        if(err){
            res.json(
              {
                configuration: 'fail',
                error : err,
            }  
            );
            return;
        }
        // when there is no error
        res.json({
            configuration: "Success",
            user : user,
        })
    })
}) 

router.get("/register", (req, res, next) => {
    res.render("register", null);
})

module.exports = router;