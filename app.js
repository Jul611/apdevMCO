//npm init
//npm i express express-handlebars body-parser

const express = require('express');
const server = express();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo');
const handlebars = require("express-handlebars");

server.set("view engine", "hbs");
server.engine("hbs", handlebars.engine({
    extname: "hbs"
}));

function errorFn(err) {
    console.log('Error found. Please trace!');
    console.error(err);
}

const User = require('./models/user');
const Reservation = require('./models/reservation')

const dbURL = 'mongodb+srv://julrquirante:julianroy61@labrat-db.uvpmsyo.mongodb.net/labrat-db?retryWrites=true&w=majority&appName=labrat-DB'
mongoose.connect(dbURL)
.then(() => {
    console.log("Connected to Database");
})
.catch(() => {
    console.log("Failed to connect to the Database");
})

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(session({
    secret: 'hi',
    resave: false,
    saveUninitialized: false,
    
}));


/* const sampleReservation = new Reservation({
    date: '23/06/2024',
    seatNum: '1',
    labNum: '1',
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    reservedBy: 'John Doe',
    isAnon: false
});

// Save the sample reservation to the database
sampleReservation.save()
    .then(savedReservation => {
        console.log('Sample reservation saved:');
        console.log(savedReservation);
    })
    .catch(err => console.error('Error saving reservation:', err))

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs'
})); */

server.use(express.static('public'));

server.get('/', function(req, resp){
    resp.render('login',{
        layout: 'layoutLogin',
        title: 'Lab Rat Login'
    });
});


server.get('/index', function(req, resp){
    resp.render('index',{
        layout: 'layoutIndex',
        title: 'Student Home'
    });
});
    

server.get('/techindex', function(req, resp){
    resp.render('techindex',{
        layout: 'layoutIndex',
        title: 'Student Home'
    });
});

// POST login
server.post('/login', async (req, res) => {
    const { email, password, remember } = req.body;
    let errors = [];

    // Check fields
    if (!email || !password) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (errors.length > 0) {
        return res.render('login', {
            layout: 'layoutLogin',
            title: 'Lab Rat Login',
            errors,
            email,
            password
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            errors.push({ msg: 'No user found with this email' });
            return res.render('login', {
                layout: 'layoutLogin',
                title: 'Lab Rat Login',
                errors,
                email,
                password
            });
        }

        // Match password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            errors.push({ msg: 'Incorrect password' });
            return res.render('login', {
                layout: 'layoutLogin',
                title: 'Lab Rat Login',
                errors,
                email,
                password
            });
        }

        // Password matched
        req.session.user = user;
        // Store username
        req.session.username = user.username;
        if (user.usertype === 'student') {
            return res.redirect('/index');
        } else if (user.usertype === 'labTech') {
            return res.redirect('/techindex');
        }

    } catch (err) {
        console.error(err);
        return res.status(500).send('Server error');
    }
});

server.get('/register', function(req, resp){
    resp.render('register',{
        layout: 'layoutRegister',
        title: 'Registration'
    });
});

// POST register
server.post('/register', async (req, res) => {
    const { username, email, password, password2, usertype } = req.body;
    let errors = [];

    // Check required fields
    if (!username || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check password length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            layout: 'layoutRegister',
            title: 'Registration',
            errors,
            username,
            email,
            password,
            password2,
            usertype
        });
    } else {
        // Validation passed
        try {
            const existingUser = await User.findOne({ email: email });

            if (existingUser) {
                errors.push({ msg: 'Email is already registered' });
                res.render('register', {
                    layout: 'layoutRegister',
                    title: 'Registration',
                    errors,
                    username,
                    email,
                    password,
                    password2,
                    usertype
                });
            } else {
                const newUser = new User({
                    username,
                    email,
                    password,
                    usertype
                });

                // Hash password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, async (err, hash) => {
                        if (err) throw err;
                        // Set password to hashed
                        newUser.password = hash;
                        // Save user
                        await newUser.save();
                        res.redirect('/');
                    });
                });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    }
});


server.get('/studentlabs', function(req, resp){
    resp.render('studentlabs',{
        layout: 'layoutLabs',
        title: 'Check Out Our Laboratories!'
    });
});

server.get('/techlabs', function(req, resp){
    resp.render('techlabs',{
        layout: 'layoutLabs',
        title: 'Check Out Our Laboratories!'
    });
});

server.get('/studentreservations', function(req, resp){
    resp.render('studentreservations',{
        layout: 'layoutReservation',
        title: 'Your Reservations'
    });
});

server.get('/techreservations', function(req, resp){
    resp.render('techreservations',{
        layout: 'layoutReservation',
        title: 'All Reservations'
    });
});

server.get('/studentprofile', function(req, resp){
    console.log('Username in session:', req.session.username);
    const studentSearchQuery = { username: req.session.username };

    User.findOne(studentSearchQuery).lean().then(function (user) {
        

        console.log(user); // Make sure you have the correct object keys here

        resp.render('studentprofile', {
            layout: 'layoutProfile',
            title: 'Student Profile',
            email: user.email,
            username: user.username,
            usertype: user.usertype,
            desc: user.desc
        });

    }).catch(function (error) {
        console.error('Error finding user:', error);
        resp.status(500).send('Error finding user');
    });
});

server.get('/studentprofileedit', function(req, resp){
    console.log('Username editing:', req.session.username);
    const studentSearchQuery = { username: req.session.username };

    User.findOne(studentSearchQuery).lean().then(function (user) {
        
        console.log(user); // Make sure you have the correct object keys here

        resp.render('studentprofileedit', {
            layout: 'layoutProfileEdit',
            title: 'Student Profile',
            username: user.username,
            desc: user.desc,
            pfp: user.pfp
        });

    }).catch(function (error) {
        console.error('Error finding user:', error);
        resp.status(500).send('Error finding user');
    });
});

server.use(bodyParser.urlencoded({ extended: true }));

server.post('/studentprofileedit', function(req, resp){
    const username = req.body.username;
    const desc = req.body.desc;
    const pfp = req.body.pfp;

    console.log('Session username:', req.session.username);
    console.log('Form data:', { username, desc, pfp });

    const updateQuery = { username: req.session.username };
    const updateData = {
        username: username,
        desc: desc,
        pfp: pfp
    };

    User.findOneAndUpdate(updateQuery, updateData, { new: true }).then(function(updatedUser) {
        
        req.session.username = updatedUser.username;
        console.log('User updated:', updatedUser);
        resp.redirect('/studentprofile');
    }).catch(function (error) {
        console.error('Error updating user:', error);
        resp.status(500).send('Error updating user');
    });
});

server.post('/deleteUser', function(req, resp) {
    const usernameToDelete = req.body.username;

    User.findOneAndDelete({ username: usernameToDelete })
        .then(function(deletedUser) {
            if (!deletedUser) {
                return resp.status(404).send('User not found');
            }

            console.log('User deleted:', deletedUser);

            // Clear the session to log the user out
            req.session.destroy(function(err) {
                if (err) {
                    console.error('Error destroying session:', err);
                    return resp.status(500).send('Error logging out');
                }
                console.log('User logged out');
                resp.sendStatus(200); // Send a success status
                
            });
        })
        .catch(function(error) {
            console.error('Error deleting user:', error);
            resp.status(500).send('Error deleting user');
        });
});

server.get('/techprofile', function(req, resp){
    resp.render('techprofile',{
        layout: 'layoutProfile',
        title: 'Tech Profile'
    });
});

server.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Failed to logout');
        }
        console.log('Session destroyed successfully');
        res.redirect('/');
    });
});

server.get('/studentbook', function(req, resp){
    resp.render('studentbook',{
        layout: 'layoutBook',
        title: 'Book a Reservation'
    });
});

server.get('/techbook', function(req, resp){
    resp.render('techbook',{
        layout: 'layoutBook',
        title: 'Book Walk-in'
    });
});

const port =  process.env.PORT | 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});

