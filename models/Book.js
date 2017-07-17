const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    owner: { type : ObjectId, ref: 'User' },
    up_for_trade: Boolean
});

const Book = mongoose.model('Book', bookSchema);

model.exports = Book;