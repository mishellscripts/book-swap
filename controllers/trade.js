const Book = require('../models/Book');
const User = require('../models/User');
const Trade = require('../models/Trade');
const mongoose = require('mongoose');
const async = require('async');

/**
 * GET /account/trades
 * Get user trades
 */
exports.getUserTrades = (req, res, next)=> {
  const userId = mongoose.Types.ObjectId(req.user._id);
  Trade.find({'sender._id': userId, status: 0}, (err, tradesSentIncomplete)=> {
    if (err) return next(err);
    Trade.find({'receiver._id': userId, status: 0}, (err, tradesReceivedIncomplete)=> {
      if (err) return next(err);
      Trade.find({'receiver._id': userId, status: 1}, (err, tradesReceivedCompleted)=> {
        Trade.find({'sender._id': userId, status: 1}, (err, tradesSentCompleted)=> {
          res.render('trades/view', {
            tradesSent: tradesSentIncomplete, 
            tradesReceived: tradesReceivedIncomplete,
            tradesCompleted: tradesReceivedCompleted.concat(tradesSentCompleted)
          });
        });
      });
    });
  });
};

/**
 * GET /trade/for/bookid
 * Get send trade form
 */
exports.getSendTrade = (req, res, next)=> {
  // Check if profile filled out
  const userProfile = req.user.profile;
  const profileComplete = userProfile.full_name && userProfile.location.city && userProfile.location.state;
   
  Book.findById(req.params.bookid, (err, book)=> {
    if (err) return next(err);
    const userId = mongoose.Types.ObjectId(req.user._id);
    // Find books user owns - check to see if > 0 
    Book.find({'owner._id': userId, up_for_trade: 1}, (err, booksForTrade)=> {
      if (booksForTrade.length == 0) {
        req.flash('errors', { msg: 'You do not have any books up for trading' });
        res.redirect('/account/books');
      } else if (!profileComplete) {
        req.flash('errors', { msg: 'Please complete your profile to enable trading.' });
        res.redirect('/account');
      } else if (book.owner._id == req.user.id) {
        res.json('You cannot trade with yourself');
      } else if (book.up_for_trade == 0) {
        res.json('Book is not up for trade');
      } else {
        // Check if trade exists with user
        Trade.findOne({'sender._id': userId, 'receiver._id': book.owner._id, 'book._id': book._id}, (err, trade1)=> {
          Trade.findOne({'sender._id': book.owner._id, 'receiver._id': userId, 'offer._id': book._id}, (err, trade2)=> {
            if (trade1) {
              res.redirect('/trade/' + trade1._id);
            } else if (trade2) {
              res.redirect('/trade/' + trade2._id);
            } 
            else {
              User.findById(book.owner, (err, owner)=> {
              if (err) return next(err);
                res.render('trades/request', {book: book, receiver: owner, sender: req.user});
              }); 
            }
          });
        });
      }
    });
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
    sender: req.user,
    message: req.body.message
  });

  User.findById(req.body.receiverId, (err, receiver)=> {
    if (err) return next(err);
    trade.receiver = receiver;
    Book.findById(req.body.bookid, (err, offer)=> {
      if (err) return next(err);
      trade.offer = offer;
      Book.findById(req.params.bookid, (err, book)=> {
        if (err) return next(err);
        trade.book = book;
        trade.save(err => {
          if (err) return next(err);
          req.flash('success', { msg: 'Trade successfully sent' });
          res.redirect('/trade/' + trade.id);
        });
      });
    });
  });
 }

 /**
  * GET /trade/tradeid
  * Get trade detail page
  */
exports.getTradeDetail = (req, res, next)=> {
  Trade.findById(req.params.tradeid, (err, trade)=> {
    if (err) return next(err);
    res.render('trades/detail', {
      trade: trade, 
      isSender: req.user.id == trade.sender._id
    });
  });
};

/**
 * GET /trade/accept/tradeid
 * Accept trade
 */
 exports.acceptTrade = (req, res, next)=> {
   Trade.findById(req.params.tradeid, (err, trade)=> {
    async.waterfall([callback=>{
      // Update trade and book details
      trade.status = 1;
      trade.save(err=> {
        if (err) return next(err);
        Book.findByIdAndUpdate(trade.book._id, {$set: {owner: trade.sender}}, {upsert: true});
        Book.findByIdAndUpdate(trade.offer._id, {$set: {owner: trade.receiver}}, {upsert: true});
      });
      callback(null);
    }, ()=> {
      // Update user details
      // Exchange books between users
      User.findByIdAndUpdate(trade.sender._id, {
        $pull: {books: {_id: trade.offer._id}},
      }, err=> {
        User.findByIdAndUpdate(trade.sender._id, {
          $push: {books: trade.book}
        }, err=> {
          User.findByIdAndUpdate(trade.receiver._id, {
            $pull: {books: {_id: trade.book._id}},
          }, err=> {
          User.findByIdAndUpdate(trade.receiver._id, {
            $push: {books: trade.offer}
            }, err=> {
              req.flash('success', { msg: 'Trade complete!' });
              res.redirect('/trade/' + req.params.tradeid);
            });
          });
        });
      });
    }]);
  });
 };

 /**
 * GET /trade/cancel/tradeid
 * Cancel trade
 */
exports.cancelTrade = (req, res, next)=> {
  Trade.findByIdAndRemove(req.params.tradeid, err=> {
    if (err) return next(err);
    res.redirect('/account/trades');
  });
};