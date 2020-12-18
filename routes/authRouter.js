const express = require('express');
const Router = express.Router();
const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: './images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage: storage
})

Router.post('/signup',upload.single('picture'), (req, res) => {
    const { name, email, password, number, DOB } = req.body;
    const picture= `http://localhost:5000/profile/${req.file.filename}`
    User.findOne({
        email
    }).exec((err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is already exists!'
            });
        } else {
            const user = new User({
                email,
                name,
                password,
                number,
                DOB,
                picture
            });
            user.save((err, user) => {
                if (err) {
                    console.log('Save error', err);
                    return res.status(401).json({
                        errors: err
                    });
                } else {
                    return res.status(200).json({
                        message: 'Signup successful!'
                    });
                }
            });
        }
    });
});

Router.post('/signin', (req, res) => {
    const { email, password } = req.body;
    User.findOne({
        email
    }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                errors: 'User with that email does not exist'
            });
        }
        // authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                errors: 'Email and password do not match'
            });
        } else {
            const name = user.name;
            const email = user.email;
            const password = user.hashed_password;
            const number = user.number;
            const DOB = user.DOB;
            const image=user.picture;
            const token = jwt.sign(
                {
                    name,
                    email,
                    password,
                    number,
                    DOB,
                    image
                },
                '@TeamIAF',
                {
                    expiresIn: '1d'
                }
            );
            return res.status(200).json({
                message: token
            });
        }
    });
});


Router.post('/getCreds', (req, res) => {
    const token = req.body.token;

    const dt = jwt.decode(token, {
        complete: true
    })
    return res.status(200).json({
        credentials: dt.payload
    });
});

Router.post('/addtocontacts', (req, res) => {
    const user1 = req.body.user1;
    const user2 = req.body.user2;

    const User1Token = jwt.decode(user1, {
        complete: true
    })

    const User2Token = jwt.decode(user2, {
        complete: true
    })

    console.log(User1Token,User2Token)

    User.updateOne({
        email:User2Token.payload.email
    },
    {
        $push:{contactlist:User1Token.payload.image}
    },function (err, success) {
        if(success){
            return res.status(200).json({
                message:"contact list updated successfully!"
            }); 
        }
    }   
    )

    
});

module.exports = Router;