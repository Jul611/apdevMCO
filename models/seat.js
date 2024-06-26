const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const seatSchema = new Schema({
    labNum: {type: String, required: true},
    seatNum: {type: String, required: true},
    isTaken: {type: Boolean, required: true}
    
}, {timestamps: true });

const Seat = mongoose.model('Seat', seatSchema);
module.exports = Seat;