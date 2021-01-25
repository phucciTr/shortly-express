const models = require('../models');
const Promise = require('bluebird');


module.exports.createSession = (req, res, next) => {

  /* if (request obj) (has no cookies),
   generate a (session) with a (unique hash)
   The function should use this (unique hash)
   to set a (cookie) in the (response headers) */

  Promise.resolve(req.cookies.shortlyid)
    .then((hash) => {
      if (!hash) { throw hash; }
      return models.Sessions.get({hash});
    })
    .tap((session) => {
      if (!session) { throw session; }
    })
    .catch(() => {
      return models.Sessions.create()
        .then(({insertId}) => {
          return models.Sessions.get({id: insertId});
        })
        .tap((session) => {
          res.cookie('shortlyid', session.hash);
        });
    })
    .then((session) => {
      req.session = session;
      next();
    });

};


/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.verifySession = (req, res, next) => {
  if (!models.Sessions.isLoggedIn(req.session)) {
    res.redirect('/login');

  } else { next(); }
};