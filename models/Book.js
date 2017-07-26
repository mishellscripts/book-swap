const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    up_for_trade: { type: Number, default: 0 },
    imageURL: String,
    owner_description: String,
    search_description: String,
    rating: Number
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;