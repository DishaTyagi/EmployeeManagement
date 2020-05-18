var express  = require('express');
var app  = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

mongoose.connect(configDB.url); 

require('./config/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(express.urlencoded({extended: true})); 

app.set('view engine', 'ejs'); 

app.use(session({ secret: 'ilovedish' })); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash());

require('./app/routes.js')(app, passport); 
app.listen(port, () => {
    console.log("Server running on port 3000");
    
})