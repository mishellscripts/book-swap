const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    up_for_trade: { type: Boolean, default: false },
    imageURL: String,
    description: String
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;