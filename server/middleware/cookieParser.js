const hasCookie = (cookie) => {
  return cookie && Object.keys(cookie).length > 0;
};

const hasMultipleCookies = (cookie) => {
  return cookie.indexOf(';') !== -1;
};

const hasSpace = (key) => {
  return key.indexOf(' ') !== -1;
};

const removeSpace = (key) => {
  return key.trim();
};

const parse = (cookie) => {
  let [key, value] = cookie.split('=');
  key = hasSpace(key) ? removeSpace(key) : key;

  cookie = {};
  cookie[key] = value;
  return cookie;
};

const mergeCookies = (cookie1, cookie2) => {
  cookie2 = parse(cookie2);
  return Object.assign(cookie1, cookie2);
};

const parseCookies = (req, res, next) => {

  // Send new cookie to the request
  // res.cookie('theCookie', 'newCookie');
  // res.cookie('secondOne', 'anotherCookie');

  // Clear specified cookies from the client
  // res.clearCookie('theCookie');
  // res.clearCookie('shortlyid');

  let parsedCookies = {};
  let cookies = req.get('Cookie');


  if (!hasCookie(cookies)) { req.cookies = {}; }

  if (hasCookie(cookies)) {
    if (!hasMultipleCookies(cookies)) { req.cookies = parse(cookies); }

    if (hasMultipleCookies(cookies)) {
      cookies.split(';').forEach((cookie) => {
        parsedCookies = mergeCookies(parsedCookies, cookie);
      });
      req.cookies = parsedCookies;
    }
  }
  next();
};


module.exports = parseCookies;
