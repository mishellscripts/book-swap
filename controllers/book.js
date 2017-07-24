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
    description: req.body.description,
    imageURL: req.body.imageURL
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
    description: 'View and manage your book collection',
    userView: true
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
  console.log('happens');
  Book.findByIdAndRemove(req.params.bookid, (err, result)=> {
    if (err) console.log(err); 
    else {
      User.findByIdAndUpdate(result.owner, {$pull: {books: result}}, err=>{
        res.redirect('/account/books');
      });
    }
  });
}