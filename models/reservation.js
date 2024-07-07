const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    date: {type: String, required: true},
    seatNum: {type: String, required: true},
    labNum: {type: String, required: true},
    time: {type: String, required: true},
    reservedBy: {type: String, required: true},
    reservedByID: {type: String, required: true},
    isAnon: {type: Boolean, required: false, default: false}

}, {timestamps: true });

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;