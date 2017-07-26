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
    owner: req.user.id,
    title: req.body.title,
    author: req.body.author,
    up_for_trade: req.body.tradestatus,
    imageURL: req.body.imageURL,
    owner_description: req.body.owner_description,
    search_description: req.body.description,
    rating: req.body.rating
  });

  book.save((err) => {
    if (err) { return next(err); }
    User.findByIdAndUpdate(req.user.id, {$push: {books: book}}, err=> {
      if (err) { return next(err); }
      res.redirect('/account/books');
    });
  });
};

/**
 * GET /book/bookid
 * Book detail page
 */
exports.getBookDetail = (req, res, next)=> {
  Book.findById(req.params.bookid, (err, result)=> {
    User.findById(result.owner, (err, user)=> {
      if (err) console.log(err);
      else {
        console.log(result);
        res.render('books/detail', {
          book: result, 
          owner_name: user.profile.full_name || user.email, 
          owner_id: result.owner,
          isOwners: req.user && result.owner == req.user.id
        });
      }
    });      
  });
}

/**
 * GET /account/books
 * View and manage books page
 */
exports.getUserBooks = (req, res, next)=> {
  res.render('books/view', {
    title: 'My book collection',
    books: req.user.books,
    description: 'View and manage your book collection'
  });
}

/**
 * GET /view
 * Book dashboard page
 */
exports.getAllBooks = (req, res, next)=> {
  Book.find({}, (err, result)=> {
    if (err) console.log(err);
    else {
      res.render('books/view', {
        title: 'Book dashboard',
        books: result,
        description: ''
      });
    }
  });
}

/**
 * GET /remove/bookid
 * Remove a book
 */
exports.removeBook = (req, res, next)=> {
  Book.findOne({_id: req.params.bookid}, (err, book)=> {
    if (err) console.log(err);
    else if (book.owner == req.user.id) {  
      book.remove();
      User.findByIdAndUpdate(book.owner, {$pull: {books: book}}, err=>{
        res.redirect('/account/books');
      });
    } else {
      res.json('Error 403. You do not have the permissions to do this.');
    }
  });
};

/**
 * GET /toggle/bookid
 * Toggle book trade status
 */
exports.toggleBookTradeStatus = (req, res, next)=> {
  Book.findOne({_id: req.params.bookid}, (err, book)=> {
    if (book.owner == req.user.id) {
      Book.findByIdAndUpdate(req.params.bookid, {$bit: {up_for_trade: {xor: 1}}}, err=>{
        if (err) console.log(err);
        else {
          res.redirect('/book/' + req.params.bookid);
        }
      });
    }
    else {
      res.json('Error 403. You do not have the permissions to do this.');
    }
  });
};

/**
 * GET /account/trades
 * Get user trades
 */
exports.getUserTrades = (req, res, next)=> {
  res.render('books/trades');
}