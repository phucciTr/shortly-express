const models = require('../models');
const Promise = require('bluebird');
const { parseCookies, hasCookie } = require('./cookieParser.js');


const attachCookies = (res, session) => {
  res.cookies = {};
  res.cookies['shortlyid'] = session.hash;
  return res;
};

const attachSession = (req, session) => {
  req.session = session;
  return req;
};

module.exports.createSession = (req, res, next) => {

  let cookies = req.cookies;

  /* if (request obj) (has no cookies),
   generate a (session) with a (unique hash)
   The function should use this (unique hash)
   to set a (cookie) in the (response headers) */
  if (!hasCookie(cookies)) {
    models.Sessions.create()
      .then(({insertId}) => models.Sessions.get({id: insertId}))
      .then((session) => {
        res = attachCookies(res, session);
        next(session);
      });

  }

  /* If an (incoming request has a cookie), verify that the (cookie is
  valid) (i.e., it is a (session) that is (stored) in (your database)).
  and assigns an (object) to the (session property) on the (request) that
  contains (relevant user information).
*/
  if (hasCookie(cookies)) {
    let { shortlyid } = cookies;

    models.Sessions.get({hash: shortlyid})
      .then((session) => {
        req = attachSession(req, session);
        next(session);
      })
      .catch(() => {
        models.Sessions.create()
          .then(({insertId}) => models.Sessions.get({id: insertId}))
          .then((session) => {
            res = attachCookies(res, session);
            next(session);
          });
      });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

