const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    seatNum: {type: String, required: true},
    isTaken: {type: Boolean, required: true}
    
}, {timestamps: true });

const Seat = mongoose.model('Seat', userSchema);
module.exports = Seat;