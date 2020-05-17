const express = require('express');
const session = require('express-session');
const {User} = require('./db');
const passport = require('./setuppassport');
const flash = require('connect-flash');

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(express.json());

app.use(
    session({
        secret: 'shhh. fir koi hai',
        resave: false,
        saveUninitialized: true,
        cookie:{
            maxAge: 1000*60*60     //in milliseconds
        }
    })
)

//must come after session middleware
app.use(passport.initialize())
app.use(passport.session())

app.use(flash());

//root route -> signup
app.get('/', (req,res) => {
    res.render('signup');
});

//Post request to signup page i.e. root route
app.post('/', (req,res) => {
    const user_username= req.body.username;
    const user_email = req.body.email;
    const user_password= req.body.password;

    User.findOne({username: user_username}, (err, foundItem) => {
        if(!err){
            if(!foundItem){
                const newUser = new User({
                    username: user_username,
                    email: user_email,
                    password: user_password
                });
                newUser.save((err) => {
                    if(!err){
                        console.log(user_username+ " added in database.");
                        
                        res.redirect('/login');
                    }
                })
            }else{
                console.log('User already exists! Please Login.');
                res.redirect('/login');
            }
        }
        else{
            console.log("ERROR!");
        }
    })
});


app.get('/login', (req,res) => {
    res.render('login');
});

app.post('/login', (req,res) => {
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect:'/login',
    }),
    (req,res) => {
        console.log("If this function is called, authentication is successfull");
        console.log("Authenticated user is "+ req.user);
        
    }
});

function checkloggedIn(req,res,next){
    if(req.user){
        return next();
    }
    res.redirect('/login');
}

app.get('/home', checkloggedIn, (req,res)=> {
    res.render('home', {user_name: req.user.username});
})

app.listen(3000, () =>{
    console.log("Server started on port 3000");
})