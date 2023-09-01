const mongoose = require("mongoose");
const bcrypt = require("bcrypt")

const User = new mongoose.Schema({
    username:{type:String, null: false, unique: true},
    email:{type: String, null: false, unique: true},
    password:{type: String, null: false},
    timestamp:{type: Date, default:Date.now()}
});

User.methods.isValidPassword = (password) => {
    return bcrypt.compareSync(this.password, password)
}

module.exports = mongoose.model("User", User);