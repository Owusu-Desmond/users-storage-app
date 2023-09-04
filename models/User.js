const mongoose = require("mongoose");
const bcrypt = require("bcrypt")

const User = new mongoose.Schema({
    username:{type:String, null: false, unique: true},
    email:{type: String, null: false, unique: true},
    password:{type: String, null: false},
    timestamp:{type: Date, default:Date.now()}
});

// hash password before saving to database
User.pre("save", function (next) {
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hashSync(this.password, 10);
    next();
})

User.methods.isValidPassword = (password) => {
   getHashedPassword = bcrypt.hashSync(password, 10);
   return bcrypt.compareSync(password, getHashedPassword); 
}

module.exports = mongoose.model("User", User);