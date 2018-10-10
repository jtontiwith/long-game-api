'use strict';
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');

const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { outcomesModel } = require('./models');
//const PORT = process.env.PORT || 3000;



console.log(DATABASE_URL);

const jsonParser = bodyParser.json();
const app = express();
app.use(express.static('public'));
//app.use(morgan('common'));
app.use(jsonParser);
app.use(cors());

// Logging
app.use(morgan('common'));

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/users/', usersRouter);
app.use('/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/api/*', (req, res) => {
  res.json({ok: true});
});

app.get('/outcomes/:userId', jsonParser, (req, res) => {
  outcomesModel
    .find({ user_id: req.params.userId })
    .then(outcomesModels => {
      res.json({
        outcomesModels: outcomesModels.map(outcomesModel => outcomesModel.serialize())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
});

app.post('/outcomes', jsonParser, (req, res) => {
  const requiredFields = ['whatText', 'date', 'range', 'user_id'];
  for(let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  outcomesModel
    .create({
      whatText: req.body.whatText,
      whyText: req.body.whyText,
      date: req.body.date,
      range: req.body.range,
      user_id: req.body.user_id,
    })
  .then(
    outcomesModel => res.status(201).json(outcomesModel.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal Server Error'})
  });
});

app.put('/outcomes/:id', jsonParser, (req, res) => {
  console.log(req.body.id);
  const requiredFields = ['id'];
  for(let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    console.log(req.body);
    if(!(field in req.body)) {
      const message = 'The id is not in the request body';
      console.error(message);
      return res.status(400).send(message);
    }
  }
   //this below is just another type of validation, common validation pattern
   if (req.params.id !== req.body.id) {
    const message = `Request path id ${req.params.id} and request body id ${req.body.id} must match`;
    console.error(message);
    return res.status(400).send(message);
  }

  console.log(`Updating outcome ${req.params.id}`);
  const toUpdate = {};
  const updateableFields = ['whatText', 'whyText', 'date', 'range'];

  updateableFields.forEach(field => {
    if(field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  outcomesModel.findByIdAndUpdate(req.params.id, { $set: toUpdate })
  .then(outcomesModel => res.status(204).end())
  .catch(err => res.status(500).json({ message: 'Internal Server Error' }));
});

app.delete('/outcomes/:id', jsonParser, (req, res) => {
  const requiredField = 'id';
  if(!(requiredField in req.params)) {
    const message = 'The id is not in the params of the request';
  } 
  outcomesModel.findByIdAndRemove(req.params.id)
  .then(outcomesModel => res.status(204).end())
  .catch(err => res.status(500).json({ message: 'Internal Server Error'}));
});

let server;

function runServer(DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    console.log(DATABASE_URL);
    mongoose.connect(
      DATABASE_URL,
      err => {
        if(err) {
          return reject(err);
        }
        server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on("error", err => {
          mongoose.disconnect();
          reject(err);
        });
      }
    );
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closeing server");
      server.close(err => {
        if(err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

//app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = { app, runServer, closeServer };


