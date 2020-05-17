const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const {User} = require('./db');

passport.use(new localStrategy((username, password, done) => {
    User.findOne({username: username}, (foundUser, err) => {
        if(!err){
            if(!foundUser){
                console.log("user with that username not found.");                
            }else{
                console.log("user with that username exists!");                
            }
        }else{
            console.log("err in findOne.");
            
        }
    })
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
})

module.exports = passport;
