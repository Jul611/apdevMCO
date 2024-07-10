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
const router = express.Router();

server.set("view engine", "hbs");
server.engine("hbs", handlebars.engine({
    extname: "hbs"
}));


const User = require('./models/user');
const Reservation = require('./models/reservation');


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
server.use(bodyParser.urlencoded({ extended: true }));

server.use(session({
    secret: 'hi',
    resave: false,
    saveUninitialized: false,
    
}));

 /* const newReservation = {
    date: '2024-06-26', // Replace with the desired date (YYYY-MM-DD format)
    seatNum: '1', // Replace with the seat number
    labNum: '1', // Replace with the lab number
    time: '07:00 AM - 8:00 AM', // Replace with the start time // Replace with the end time
    reservedBy: 'tester1', // Replace with the name of the person reserving
    isAnon: false // Set to true for anonymous reservations
  };

  Reservation.create(newReservation)
  .then(reservation => console.log('Reservation created:', reservation))
  .catch(err => console.error('Error creating reservation:', err));  */

/* async function insertLabSeats(labNum) {
    const seats = [];
    for (let i = 1; i <= 10; i++) {
      seats.push({ labNum, seatNum: i, isTaken: false });
    }
  
    try {
      await Seat.insertMany(seats);
      console.log(`Successfully inserted 10 seats for lab ${labNum}`);
    } catch (error) {
      console.error(`Error inserting seats for lab ${labNum}:`, error);
    }
  }
  
  // Insert seats for all 3 labs
  (async () => {
    await insertLabSeats(1); // Assuming lab numbers start from 1
    await insertLabSeats(2);
    await insertLabSeats(3);
  })();
  
  console.log('Data insertion completed.'); */


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
        req.session._id = user._id;
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

server.get('/studentreservations', async function(req, resp) {
    try {
        // Fetch reservations for the logged-in user
        const reservations = await Reservation.find({ reservedByID: req.session._id }).lean();
        
        // Render the template with the fetched reservations
        resp.render('studentreservations', {
            layout: 'layoutReservation',
            title: 'Your Reservations',
            reservations: reservations
        });
    } catch (err) {
        console.error(err);
        resp.status(500).send('Internal Server Error');
    }
});

server.get('/editreservation/:id', async function(req, resp) {
    try {
        const reservation = await Reservation.findById(req.params.id).lean();
        resp.json(reservation); // Send JSON response with reservation data
    } catch (err) {
        console.error(err);
        resp.status(500).json({ error: 'Failed to fetch reservation' });
    }
});

server.post('/editreservation/:id', (req, res) => {
    const reservationId = req.params.id;
    const updatedReservation = {
        labNum: req.body.labNum,
        seatNum: req.body.seatNum,
        date: req.body.date,
        time: req.body.time,
    };

    // Check for conflicting reservations
    Reservation.findOne({
        labNum: updatedReservation.labNum,
        seatNum: updatedReservation.seatNum,
        date: updatedReservation.date,
        time: updatedReservation.time,
        _id: { $ne: reservationId } // Exclude the current reservation being updated
    })
    .then(conflictingReservation => {
        if (conflictingReservation) {
            // Conflict found
            res.status(409).send('Conflict detected with the reservation');
        } else {
            // No conflict, proceed with update
            Reservation.findByIdAndUpdate(reservationId, updatedReservation, { new: true })
                .then(updatedDoc => {
                    res.json(updatedDoc);
                })
                .catch(error => {
                    console.error('Error updating reservation:', error);
                    res.status(500).send('Error updating reservation');
                });
        }
    })
    .catch(error => {
        console.error('Error checking for conflicting reservations:', error);
        res.status(500).send('Error checking for conflicting reservations');
    });
});


server.delete('/cancelreservation/:id', (req, res) => {
    const reservationId = req.params.id;
    
    Reservation.findByIdAndDelete(reservationId)
        .then(deletedReservation => {
            if (!deletedReservation) {
                return res.status(404).send('Reservation not found');
            }
            res.status(200).json({ message: 'Reservation canceled successfully' });
        })
        .catch(error => {
            console.error('Error canceling reservation:', error);
            res.status(500).send('Error canceling reservation');
        });
});

server.get('/techreservations', async function(req, resp) {
    try {
        // Fetch all reservations from the database
        const allReservations = await Reservation.find({}).lean();
        
        // Render the template with the fetched reservations
        resp.render('techreservations', {
            layout: 'layoutReservation',
            title: 'All Reservations',
            reservations: allReservations
        });
    } catch (err) {
        console.error(err);
        resp.status(500).send('Internal Server Error');
    }
});

server.get('/studentprofile', async function(req, resp){
    console.log('Username in session:', req.session.username);
    const studentSearchQuery = { username: req.session.username };
    const reservations = await Reservation.find({ reservedByID: req.session._id }).lean();

    User.findOne(studentSearchQuery).lean().then(function (user) {
    

        console.log(user); // Make sure you have the correct object keys here

        resp.render('studentprofile', {
            layout: 'layoutProfile',
            title: 'Student Profile',
            email: user.email,
            username: user.username,
            usertype: user.usertype,
            desc: user.desc,
            reservations: reservations
        });

    }).catch(function (error) {
        console.error('Error finding user:', error);
        resp.status(500).send('Error finding user');
    });
});

server.get('/searchprofile', function(req, resp) {
    const searchUsername = req.query.username; // Get username from query parameter
    console.log('search for', searchUsername);
        

    User.findOne({ username: searchUsername }).lean().then(function(foundUser) {
        if (foundUser) {
            resp.render('searchprofile', {
                layout: 'layoutSearchProfile', // Adjust layout as needed
                title: 'User Profile',
                desc: foundUser.desc,
                email: foundUser.email,
                username: foundUser.username,
                usertype: foundUser.usertype,
                pfp: foundUser.pfp,
            });
        }
        else{
            resp.render('nouser', {
                layout: 'layoutNoUser',
                title: 'User not Found'
            });
        }

        
        

    }).catch(function(error) {
        console.error('Error searching for user:', error);
        resp.status(500).send('Error searching for user');
    });
});

server.get('/nouser', function(req, resp){
    resp.render('nouser',{
        layout: 'layoutReservation',
        title: 'All Reservations'
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



server.post('/studentprofileedit', function(req, resp){
    const newUsername = req.body.username;
    const desc = req.body.desc;
    const pfp = req.body.pfp;

    console.log('Session username:', req.session.username);
    console.log('Form data:', { newUsername, desc, pfp });

    const updateQuery = { username: req.session.username };
    const updateData = {
        username: newUsername,
        desc: desc,
        pfp: pfp
    };

    User.findOneAndUpdate(updateQuery, updateData, { new: true }).then(function(updatedUser) {
        req.session.username = updatedUser.username;
        console.log('User updated:', updatedUser);

        // Update the reservedBy in the reservations 
        const reservationUpdateQuery = { reservedBy: updateQuery.username };
        const reservationUpdateData = { reservedBy: newUsername };

        Reservation.updateMany(reservationUpdateQuery, reservationUpdateData).then(function(updateResult) {
            console.log('Reservations updated:', updateResult);
            resp.redirect('/studentprofile');
        }).catch(function (error) {
            console.error('Error updating reservations:', error);
            resp.status(500).send('Error updating reservations');
        });
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
    console.log('Username in session:', req.session.username);
    const studentSearchQuery = { username: req.session.username };

    User.findOne(studentSearchQuery).lean().then(function (user) {
        

        console.log(user); // Make sure you have the correct object keys here

        resp.render('techprofile', {
            layout: 'layoutProfile',
            title: 'Tech Profile',
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

server.get('/techprofileedit', function(req, resp){
    console.log('Username editing:', req.session.username);
    const studentSearchQuery = { username: req.session.username };

    User.findOne(studentSearchQuery).lean().then(function (user) {
        
        console.log(user); // Make sure you have the correct object keys here

        resp.render('techprofileedit', {
            layout: 'layoutProfileEdit',
            title: 'Tech Profile',
            username: user.username,
            desc: user.desc,
            pfp: user.pfp
        });

    }).catch(function (error) {
        console.error('Error finding user:', error);
        resp.status(500).send('Error finding user');
    });
});

server.post('/techprofileedit', function(req, resp){
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
        resp.redirect('/techprofile');
    }).catch(function (error) {
        console.error('Error updating user:', error);
        resp.status(500).send('Error updating user');
    });
});

server.post('/techdeleteUser', function(req, resp) {
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

server.get('/techsearchprofile', function(req, resp) {
    const searchUsername = req.query.username; // Get username from query parameter
    console.log('search for', searchUsername);
        

    User.findOne({ username: searchUsername }).lean().then(function(foundUser) {
        if (foundUser) {
            resp.render('techsearchprofile', {
                layout: 'layoutSearchProfile', // Adjust layout as needed
                title: 'User Profile',
                desc: foundUser.desc,
                email: foundUser.email,
                username: foundUser.username,
                usertype: foundUser.usertype,
                pfp: foundUser.pfp,
            });
        }
        else{
            resp.render('technouser', {
                layout: 'layoutNoUser',
                title: 'User not Found'
            });
        }

    }).catch(function(error) {
        console.error('Error searching for user:', error);
        resp.status(500).send('Error searching for user');
    });
});

server.get('/technouser', function(req, resp){
    resp.render('technouser',{
        layout: 'layoutReservation',
        title: 'All Reservations'
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


server.post('/reserve', async (req, res) => {
    try {
        const { date, time, labNum, seatNum, isAnon } = req.body;
        

        const reservation = await Reservation.create({
            date,
            time,
            labNum,
            seatNum,
            reservedBy: req.session.username,
            reservedByID: req.session._id,
            isAnon
        });

        res.status(201).json({ message: 'Reservation created successfully', reservation });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

server.get('/studentbook', function(req, resp){
    resp.render('studentbook',{
        layout: 'layoutBook',
        title: 'Book a Reservation',
        
    });
});

server.get('/reservations', async (req, res) => {
    const { date, time, labNum, seatNum } = req.query;
    console.log('Received query params:', req.query); // Debug log

    try {
        const query = { date, time, labNum };
        if (seatNum) {
            query.seatNum = seatNum;
        }

        const reservations = await Reservation.find(query);
        console.log('Reservations found:', reservations); // Debug log
        res.json(reservations);
    } catch (err) {
        console.error('Error fetching reservations:', err); // Debug log
        res.status(500).send(err);
    }
});

server.get('/techbook', function(req, resp){
    resp.render('techbook',{
        layout: 'layoutBook',
        title: 'Book Walk-in'
    });
});

const port =  process.env.PORT | 3000;
server.listen(port, function(){
    console.log('Listening at port '+port);
});

