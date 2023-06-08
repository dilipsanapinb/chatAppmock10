const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    isVerified:Boolean
});

const User = mongoose.model("User", userSchema);

module.exports={User}