var LocalStrategy = require('passport-local').Strategy;

const {User, Details} = require('../app/models/user');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
        function(req, email, password, done) { // callback with email and password from our form

            User.findOne({ 'local.email' :  email }, function(err, user) {
                if (err)
                    return done(err);

                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                return done(null, user);
            });

        })
    );

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
        },
        function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
            process.nextTick(function() {

             User.findOne({ 'local.email' :  email }, function(err, user) {
                if (err)
                return done(err);

                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {

                    var newUser = new User();

                    // set the user's local credentials
                    newUser.local.email    = email;
                    newUser.local.password = newUser.generateHash(password);
                    let checkAdmin;
                    if(req.body.admin == 'true'){
                        checkAdmin = true
                    }else{
                        checkAdmin= false
                    }
                    newUser.local.isAdmin = checkAdmin ? true : false ;                         
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }

            });    

        });

    }));

};