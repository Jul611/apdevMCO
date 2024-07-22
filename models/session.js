const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    

}, {timestamps: true });

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;