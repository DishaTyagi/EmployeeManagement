const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost:27017/empDB', { useNewUrlParser: true , useUnifiedTopology: true, useFindAndModify: false });

//users schema
const usersSchema = {
    username: String,
    email: String,
    password: String
};

//model or collection
const User = mongoose.model("User", usersSchema);

module.exports= {
    User
};