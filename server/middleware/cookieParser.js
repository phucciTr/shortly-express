const parseCookies = (req, res, next) => {
  // console.log('req = ', req);
  let cookie = req.headers.cookie;

  if (cookie) {
    // console.log('req = ', req);
    console.log('cookie = ', cookie);
    console.log('typeof cookie = ', typeof cookie);
  }
};

module.exports = parseCookies;