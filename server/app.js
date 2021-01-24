const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const { createSession } = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

console.log('createSession = ', createSession);

app.get('/',
  (req, res) => {
    console.log('req.headers = ', req.headers);
    createSession(req, res, (session) => {
      res.cookie('shortlyid', `${session.hash}`, { maxAge: 900000, httpOnly: false});
      res.render('index');
    });

    // res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/login',
  (req, res) => {
    createSession(req, res, (session) => {
      res.cookie('shortlyid', `${session.hash}`, { maxAge: 900000, httpOnly: false});
      res.render('login');
    });
    // res.render('login');
  });

app.get('/signup',
  (req, res) => {
    res.render('signup');
  });

app.post('/signup',
  (req, res) => {
    models.Users.create(req.body)
      .then((result) => {
        let { insertId } = result;

        createSession(req, res, (session) => {
          let { id, hash } = session;

          console.log('session = ', session);

          models.Sessions.update({id: id}, {userId: insertId});
          res.cookie('shortlyid', `${session.hash}`, { maxAge: 900000, httpOnly: false});
          res.redirect('/login');
        });
      })
      .catch((err) => {
        res.redirect('/signup');
      });
  });

app.post('/login',
  (req, res) => {

    console.log('req.headers.cookie = ', req.headers.cookie);
    let attempted = req.body.password;

    models.Users.get(req.body)
      .then((auth) => {
        let {password, salt, id} = auth[0];
        let userId = id;
        console.log('auth = ', auth);

        if (models.Users.compare(attempted, password, salt)) {

          // get hash from sessions tb, userId 1
          models.Sessions.get({userId: userId})
            .then((result) => {
              console.log('result = ', result);

              models.Sessions.update({id: id}, {userId: insertId});
              res.cookie('shortlyid', `${result.hash}`, { maxAge: 900000, httpOnly: false});
              res.redirect('/');
            });

          // createSession(req, res, (session) => {
          //   let { id, hash } = session;
          //   // models.Sessions.update({hash: hash}, {userId: userId});
          //   // res.cookie('shortlyid', `${session.hash}`, { maxAge: 900000, httpOnly: false});

          //   res.redirect('/');

          //   // res.cookie('shortlyid', `${session.hash}`, { maxAge: 900000, httpOnly: false});
          //   // res.redirect('/login');
          // });
        }
      })
      .catch((err) => {
        res.redirect('/login');
      });


    // .then((result) => {

    //   let route = result ? '/index' : '/login';
    //   res.redirect(route);
    // })
    // .catch(() => {
    //   res.redirect('/login');
    // });

  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/





/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
