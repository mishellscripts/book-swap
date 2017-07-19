const Book = require('../models/Book');
const User = require('../models/User');
const books = require('google-books-search');

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
    owner: req.user.id
  });

  const waterfall = require('async-waterfall');

  // Validate book here (by searching google books API)
  books.search(req.body.title, function(err, results) {
    if (err) console.log(err);
    else { 
      // Allow user to select from array
      waterfall([
        (callback)=> {
          book.imageURL = results[0].thumbnail;
          book.title = results[0].title;
          book.author = results[0].author || results[0].authors.join(", ");
          callback(null);
        },
        ()=> {
          book.save((err) => {
            if (err) { return next(err); }
            User.findByIdAndUpdate(req.user.id, {$push: {books: book}}, err=> {
              if (err) { return next(err); }
              res.redirect('/account/books');
            });
          });
      }]);
    }
  })
};

/**
 * GET /book/bookid
 * Book detail page
 */
exports.getBookDetail = (req, res, next)=> {
  Book.findById(req.params.bookid, (err, result)=> {
    User.findById(result.owner, (err, user)=> {
      console.log(user);
      res.render('books/detail', {book: result, owner_name: user.profile.full_name || user.email, owner_id: result.owner});
    });      
  });
}