//npm init
//npm i express express-handlebars body-parser

const express = require('express');
const server = express();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const session = require('express-session');
const bodyParser = require('body-parser');

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



server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

server.use(session({
    secret: 'hi',
    resave: true,
    saveUninitialized: true
}));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs'
}));

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
    const { email, password } = req.body;
    let errors = [];
    
    // Check fields
    if (!email || !password) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (errors.length > 0) {
        res.render('/login', {
            layout: 'layoutLogin',
            title: 'Lab Rat Login',
            errors,
            email,
            password
        });
    } else {
        
        try {
            const user = await User.findOne({ email: email });

            if (!user) {
                errors.push({ msg: 'No user found with this email' });
                res.render('login', {
                    layout: 'layoutLogin',
                    title: 'Lab Rat Login',
                    errors,
                    email,
                    password
                });
            } else {
                // Match password
               bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    req.session.user = user;

                    if (isMatch) {
                        // Password matched
                        console.log('here0');
                        if (user.usertype === 'student') {
                            
                            console.log('here1');
                            res.redirect('/index');
                        } else if (user.usertype === 'labTech') {
                            
                            console.log('here2');
                            res.redirect('/techindex');
                        }
                    } else {
                        errors.push({ msg: 'Incorrect password' });
                        res.render('login', {
                            layout: 'layoutLogin',
                            title: 'Lab Rat Login',
                            errors,
                            email,
                            password
                        });
                    }
                });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
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
                        res.redirect('/login');
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
    resp.render('studentprofile',{
        layout: 'layoutProfile',
        title: 'Student Profile'
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

