const Book = require('../models/Book');
const User = require('../models/User');
const Trade = require('../models/Trade');

/**
 * GET /account/trades
 * Get user trades
 */
exports.getUserTrades = (req, res, next)=> {
  res.render('trades/trades');
}

/**
 * GET /trade/for/bookid
 * Get send trade form
 */
exports.getSendTrade = (req, res, next)=> {
  Book.findById(req.params.bookid, (err, book)=> {
    if (err) console.log(err);
    else if (book.up_for_trade == 0) {
      res.json('Book is not up for trade');
    } else {
      User.findById(book.owner, (err, owner)=> {
        if (err) console.log(err);
        else {
          res.render('trades/request', {book: book, receiver: owner, sender: req.user});
        }
      }); 
    }
  });
}

/**
 * POST /trade/for/bookid
 * Send a trade
 */

 exports.postSendTrade = (req, res, next)=> {
   const errors = req.validationErrors();
  
  if (errors) {
    req.flash('errors', errors);
    return res.redirect(req.path);
  }

  const trade = new Trade({
    book: req.params.bookid,
    offer: req.body.bookid,
    sender: req.user._id,
    receiver: req.body.receiverId,
    sender_status: 1,
    message: req.body.message
  });

  trade.save((err) => {
    if (err) { return next(err); }
     res.redirect('/trade/' + trade._id);
  });
 }

 /**
  * GET /trade/tradeid
  * Get trade detail page
  */

exports.getTradeDetail = (req, res, next)=> {
  Trade.findById(req.params.tradeid, (err, trade)=> {
    if (err) console.log(err);
    else {
      res.render('trades/detail', {trade: trade});
    }
  });
};