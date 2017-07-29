const Book = require('../models/Book');
const User = require('../models/User');
const Trade = require('../models/Trade');

/**
 * GET /account/trades
 * Get user trades
 */
exports.getUserTrades = (req, res, next)=> {
  Trade.find({'sender._id': req.user.id}, (err, tradesSent)=> {
    console.log(tradesSent);
    if (err) console.log(err);
    else {
      if (err) console.log(err); 
      else {
        Trade.find({'receiver._id': req.user.id}, (err, tradesReceived)=> {
          res.render('trades/trades', {tradesSent: tradesSent, tradesReceived: tradesReceived});
        });
      }
    }
  });
}

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
    sender_status: 1,
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
          req.flash('info', { msg: 'Trade successfully sent' });
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
    if (err) console.log(err);
    else {
      res.render('trades/detail', {trade: trade, isSender: req.user.id == trade.sender._id});
    }
  });
};