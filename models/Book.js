const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    owner: Object,
    up_for_trade: { type: Number, default: 0 },
    imageURL: String,
    owner_description: { type: String, required: true },
    search_description: String,
    rating: Number
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;