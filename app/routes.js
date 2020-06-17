const {User, Detail} = require('../app/models/user');
var bcrypt   = require('bcryptjs');

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('index.ejs'); 
    });

    app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    app.post('/login', function(req, res, next){
        passport.authenticate('local-login', function(err, user, info){
            if(err){
                return next(err);
            }
            if(!user){
                return res.redirect('/login');
            }
            req.logIn(user, function(err){
                if(err){
                    return next(err);
                }
                let id = req.user._id;

                User.findOne({_id: id}, (err, foundItem) => {
                    if(!err) {
                        if(foundItem){                            
                            let checkAdmin;
                            if(foundItem.local.isAdmin == true){
                                checkAdmin = true
                            }else{
                                checkAdmin = false
                            }
                            // console.log(checkAdmin);                            
                            if(checkAdmin){      
                                res.redirect('/admin_home');
                            }else{
                                res.redirect('/home');
                            }
                        }
                    }
                })
            });
        })(req, res, next);
    })

    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', function(req, res, next){
        passport.authenticate('local-signup', function(err, user, info){
            if(err){
                return next(err);
            }
            if(!user){
                return res.redirect('/signup');
            }
            req.logIn(user, function(err){
                if(err){
                    return next(err);
                }
                let checkAdmin
                if(req.body.admin == 'true')
                    checkAdmin=true
                else
                    checkAdmin=false
                console.log("req.body.admin inside signup route is " + checkAdmin );
                
                checkAdmin ? res.redirect('/admin_home') : res.redirect('/home')
            });
        })(req, res, next);
    })

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/');
    }

    function isAdmin(req, res, next){
        if(req.user.local.isAdmin == true){
            return next();
        }
        res.redirect('/login');     //if not admin
    }

    app.get('/home', isLoggedIn, (req,res) => {   
        if(req.user.local.isAdmin == true){
            return res.redirect('/admin_home');
        }
        res.render('home');
    })

    app.get('/about', isLoggedIn, (req,res) => {
        res.render('about');
    })

    app.get('/profile', isLoggedIn, function(req, res) {        
        const userId = req.user._id ;
        // const userId = req.params.userId;
        var length = 0;
        Detail.findOne({idUser: userId}, (err, foundItem) => {          
            if(!err){
                if(!foundItem){
                    length = 0 ;
                    res.render('profile', {user: req.user, length: length})
                }else{                
                    length = 1 ;
                    console.log("Item is found "+ foundItem);
                    res.render('profile', {
                        // userId: userId,
                        length: length,
                        user: req.user,
                        fname: foundItem.fname,
                        lname: foundItem.lname,
                        age: foundItem.age,
                        address: foundItem.address,
                        ph: foundItem.ph
                    })              
                }
            }else{
                console.log(err);                            
            }            
        })        
    });

    app.post('/profile',isLoggedIn, (req, res) => {
        const userId = req.user.id
        const email = req.user.email
        const fname = req.body.fname
        const lname = req.body.lname
        const age = req.body.age
        const address = req.body.address
        const ph = req.body.ph

        const detail = new Detail({
            email: email,
            idUser: userId,
            fname: fname,
            lname: lname,
            age: age,
            address: address,
            ph: ph
        });

        detail.save((err)=>{
            if(err){
                console.log("err in saving detail");                    
            }
        })
        res.render('profile',{
            user: req.user,
            length : !0,                  
            fname,
            lname,
            age,
            address,
            ph
        })          
    })

    app.get('/addDetails',isLoggedIn, (req,res) => {
        res.render('addDetails', {
            user: req.user
        });
    })

    app.get('/admin_home',isLoggedIn ,isAdmin, (req,res) => {              
        User.estimatedDocumentCount({}, function(err, count){
            if(err){
                console.log(err);                
            }
            User.find({}, function(err, foundItems){
               if(!err){
                   if(foundItems){
                    res.render('home_admin', {count: count, items: foundItems})
                   }
               }else{
                   console.log("ERROR IS " + err);                   
               }                
            })
        })
    })
    
    app.get('/admin_newuser', isLoggedIn, isAdmin, (req,res) => {
        res.render('adminNewUser');
    })

    app.post('/admin_newuser',isAdmin , isLoggedIn, (req, res) => {
        const admin = req.body.admin ;
        const email = req.body.email ;
        const hashedPassword = bcrypt.hashSync(req.body.password, 8);
                  
        const user = new User({
            'local.isAdmin': admin,
            'local.email' : email,
            'local.password': hashedPassword,
        });
        user.save((err) => {
            if(err){
                console.log("Error in saving, Admin! :/");
            }
        });         
        res.redirect('/admin_home');  
    })

    app.get('/profile/:id', isLoggedIn, isAdmin , (req,res) => {
        const id = req.params.id ;
        Detail.findOne({idUser : id}, (err, foundItem) => {
            if(!err){
                if(foundItem){
                    res.render('employeeProfile', {item: foundItem, length: 0});                    
                }else{
                    res.render('employeeProfile', {length: 1})
                }
            }else{
                console.log("ERROR.");                
            }
        })
    })

    app.get('/contact', isLoggedIn, (req,res) => {
        res.render('contact');
    })

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

