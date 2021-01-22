const hasCookie = (cookie) => {
  return cookie;
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

  let cookies = req.headers.cookie;
  let parsedCookies = {};

  if (!hasCookie(cookies)) { next({}); }

  if (hasCookie(cookies)) {
    if (!hasMultipleCookies(cookies)) { next(parse(cookies)); }

    if (hasMultipleCookies(cookies)) {
      cookies.split(';').forEach((cookie) => {
        parsedCookies = mergeCookies(parsedCookies, cookie);
      });
      next(parsedCookies);
    }
  }
};

module.exports = parseCookies;