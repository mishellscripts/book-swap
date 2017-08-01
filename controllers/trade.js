const Book = require('../models/Book');
const User = require('../models/User');
const Trade = require('../models/Trade');
const mongoose = require('mongoose');
var waterfall = require('async-waterfall');

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
      
      const userId = mongoose.Types.ObjectId(req.user._id);
      // Find books user owns - check to see if > 0 
      Book.find({'owner._id': userId, up_for_trade: 1}, (err, booksForTrade)=> {
        if (booksForTrade.length == 0) {
          req.flash('errors', { msg: 'You do not have any books up for trading' });
          res.redirect('/account/books');
        } else if (book.owner._id == req.user.id) {
          res.json('You cannot trade with yourself');
        } else if (book.up_for_trade == 0) {
          res.json('Book is not up for trade');
        } else {
          // Check if trade exists with user
          Trade.findOne({'sender._id': userId, 'receiver._id': book.owner._id, 'book._id': book._id}, (err, trade)=> {
            if (trade) {
              res.redirect('/trade/' + trade._id);
              console.log('happens');
            } else {
              User.findById(book.owner, (err, owner)=> {
              if (err) return next(err);
                res.render('trades/request', {book: book, receiver: owner, sender: req.user});
              }); 
            }
          });
        }
      });
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
    res.render('trades/detail', {
      trade: trade, 
      isSender: req.user.id == trade.sender._id,
      isComplete: trade.receiver_status == 1 && trade.sender_status == 1
    });
  });
};

/**
 * GET /trade/accept/tradeid
 * Accept trade
 */
 exports.acceptTrade = (req, res, next)=> {
   Trade.findById(req.params.tradeid, (err, trade)=> {
    waterfall(()=> {
      // Update trade status
      if (err) return next(err);
      const isSender =  req.user.id == trade.sender._id;
      if (isSender && trade.sender_status == 0) {
        trade.sender_status = 1;
      } else if (!isSender && trade.receiver_status == 0) {
        trade.receiver_status = 1;
      }
      trade.save(err=> {
        if (err) return next(err);
      });
    }, ()=> {
      // Exchange books
      if (trade.sender.status == 1 && trade.receiver_status == 1) {
        req.flash('success', { msg: 'Trade complete!' });
        //console.log(1);
        User.findByIdAndUpdate(trade.sender._id, {
          $pull: {books: {_id: trade.offer._id}},
          $push: {books: {_id: trade.book._id}}
        }, err=> {
          if (err) console.log(err);
          //console.log(2);
          User.findByIdAndUpdate(trade.receiver._id, {
            $pull: {books: {_id: trade.book._id}},
            $push: {books: {_id: trade.offer._id}}
          }, (err)=> {
            //console.log(3);
            if (err) console.log(err);
              res.json(trade);
              //res.redirect('/trade/' + req.params.tradeid);
            });
        });
      }
    });
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