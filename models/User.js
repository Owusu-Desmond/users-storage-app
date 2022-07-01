const mongoose = require("mongoose");

const User = new mongoose.Schema({
    email:{type: String, default: ""},
    password:{type: String, default: ""},
    timestamp:{type: Date, default:Date.now()}
});

module.exports = mongoose.model("User", User);