const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'I am new',
        required: true,
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

userSchema.index({email: 1},{unique:true});

module.exports = mongoose.model("User", userSchema);