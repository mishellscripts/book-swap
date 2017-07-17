const Book = require('../models/Book');
const User = require('../models/User');

/**
 * GET /new
 * Add a book form
 */
exports.getNewBook = (req, res, next)=> {
  res.render('books/new', {
      title: 'Add a book',
      books: req.user.books
    });
}

/**
 * POST /new
 * Add a book
 */
exports.postNewBook = (req, res, next)=> {
  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/new');
  }

  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    owner: req.user.id
  });

  book.save((err) => {
    if (err) { return next(err); }

    // Validate book here (by searching google books API)

    User.findByIdAndUpdate(req.user.id, {$push: {books: book}}, err=> {
      if (err) { return next(err); }
      res.redirect('/account/books');
    });
  });
};