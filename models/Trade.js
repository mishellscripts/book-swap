const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    book: Object,
    offer: Object,
    sender: Object,
    receiver: Object,
    sender_status: { type: Number, default: 0 },
    receiver_status: { type: Number, default: 0 },
    message: { type: String, required: true }
});

const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;