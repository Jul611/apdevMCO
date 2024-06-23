const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {type:String, required:true},
    username: {type: String, required:true},
    password: {type: String, required:true},
    usertype: {type: String, required: true},
    pfp: {type: String, default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'},
    desc: {type: String, default: 'This user has not set a description yet.'}
}, {timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;