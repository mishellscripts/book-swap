const Book = require('../models/Book');
const User = require('../models/User');
const Trade = require('../models/Trade');
const mongoose = require('mongoose');

/**
 * GET /account/trades
 * Get user trades
 */
exports.getUserTrades = (req, res, next)=> {
  const userId = mongoose.Types.ObjectId(req.user._id);
  Trade.find({'sender._id': userId, receiver_status: 0}, (err, tradesSentIncomplete)=> {
    if (err) return next(err);
    Trade.find({'receiver._id': userId, receiver_status: 0}, (err, tradesReceivedIncomplete)=> {
      if (err) return next(err);
      Trade.find({'receiver._id': userId, receiver_status: 1, sender_status: 1}, (err, tradesReceivedCompleted)=> {
        Trade.find({'sender._id': userId, receiver_status: 1, sender_status: 1}, (err, tradesSentCompleted)=> {
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
   
  if (profileComplete) {
    Book.findById(req.params.bookid, (err, book)=> {
      if (err) return next(err);
      // Find books user owns - check to see if > 0 
      const userId = mongoose.Types.ObjectId(req.user._id);
      Book.find({'owner._id': userId, up_for_trade: 1}, (err, booksForTrade)=> {
        if (booksForTrade.length == 0) {
          req.flash('errors', { msg: 'You do not have any books up for trading' });
          res.redirect('/account/books');
        }
      });
      if (book.owner.id == req.user.id) {
        res.json('You cannot trade with yourself');
      } else if (book.up_for_trade == 0) {
        res.json('Book is not up for trade');
      } else {
        User.findById(book.owner, (err, owner)=> {
          if (err) return next(err);
          res.render('trades/request', {book: book, receiver: owner, sender: req.user});
        }); 
      }
    });
  }
  else {
    req.flash('errors', { msg: 'Please complete your profile to enable trading.' });
    res.redirect('/account');
  }
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
    message: req.body.message,
    sender_status: 1
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
    res.render('trades/detail', {trade: trade, isSender: req.user.id == trade.sender._id});
  });
};

/**
 * GET /trade/accept/tradeid
 * Accept trade
 */

 exports.acceptTrade = (req, res, next)=> {
   Trade.findById(req.params.tradeid, (err, trade)=> {
    if (err) return next(err);
    const isSender =  req.user.id == trade.sender._id;
    if (isSender && trade.sender_status == 0) {
      trade.sender_status = 1;
    } else if (!isSender && trade.receiver_status == 0) {
      trade.receiver_status = 1;
    }
    trade.save(err=> {
      if (err) return next(err);
      if (trade.sender.status == 1 && trade.receiver_status == 1) {
        req.flash('success', { msg: 'Trade complete!' });
        trade.book.owner = trade.sender;
        trade.offer.owner = trade.receiver;
        trade.book.save();
        trade.offer.save();
      }
      res.redirect('/trade/' + req.params.tradeid);
    });
   });
 };