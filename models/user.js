const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        following: {
            type: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
            default: [],
        },
        followers: {
            type: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
            default: [],
        }
    },
    {timestamps: true}
);


module.exports = mongoose.model("User", userSchema, "User");
