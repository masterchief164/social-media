const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
        title: {
            type: String,
            trim: true,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        likes: {
            type: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
            default: [],
        },
        comments: {
            type: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
            default: [],
        }

    },
    {timestamps: true}
);

module.exports = mongoose.model("Post", postSchema, "Post");
