const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    date: {type: String, required: true},
    seatNum: {type: String, required: true},
    labNum: {type: String, required: true},
    startTime: {type: String , required: true},
    endTime: {type: String, required: true},
    reservedBy: {type: String, required: true},
    isAnon: {type: Boolean, required: true}

}, {timestamps: true });

const Reservation = mongoose.model('Reservation', userSchema);
module.exports = Reservation;