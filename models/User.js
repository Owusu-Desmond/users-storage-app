const mongoose = require("mongoose");

const User = new mongoose.Schema({
    username:{type:String, default: ""},
    email:{type: String, default: ""},
    password:{type: String, default: ""},
    timestamp:{type: Date, default:Date.now()}
});

module.exports = mongoose.model("User", User);