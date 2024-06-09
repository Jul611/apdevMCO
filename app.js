//npm init
//npm i express express-handlebars body-parser

const express = require('express');
const server = express();
const mongoose = require('mongoose');
const User = require('./models/user');

const dbURL = 'mongodb+srv://julrquirante:julianroy61@labrat-db.uvpmsyo.mongodb.net/labrat-db?retryWrites=true&w=majority&appName=labrat-DB'
mongoose.connect(dbURL)
.then(() => {
    console.log("Connected to Database");
})
.catch(() => {
    console.log("Failed to connect to the Database");
})

server.get('/add-user', (req, res) => {
    const user = new User(
        {
            email: 'julrquirante@gmail.com',
            username: 'jul',
            password: '123',
            usertype: 'Student'   }
    );

    user.save()
    .then((result) => {
        res.send(result)
        console.log('User created!')
    })
    .catch((err) => {
        console.log(err)
    })
})

server.get('/all-users', (req, res) => {
    User.find()
    .then((result) => {
        res.send(result)
    })
    .catch((err) => {
        console.log(err)
    })
})

const bodyParser = require('body-parser')
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

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

server.get('/register', function(req, resp){
    resp.render('register',{
        layout: 'layoutRegister',
        title: 'Registration'
    });
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

server.get('/login', function(req, resp){
    resp.render('login',{
        layout: 'layoutLogin',
        title: 'Lab Rat Login'
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

