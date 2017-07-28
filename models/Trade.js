const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sender_status: { type: Number, default: 0 },
    receiver_status: { type: Number, default: 0 },
    message: { type: String, required: true }
});

const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;