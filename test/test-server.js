const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const { app, runServer, closeServer } = require("../server");
const { TEST_DATABASE_URL } = require('../config');

const { outcomesModel } = require('../models');

const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);


function seedClientProjectData() {
  console.info('seeding client fake client projects');
  const seedData = [];

  for(let i = 1; i < 10; i++) {
    seedData.push(generateClientProjectData());
  }
  //this will return a promise, find out more about that
  return outcomesModel.insertMany(seedData);
}

/*
(function createUser() {
  return users.insertOne({
    email: 'some@email.com',
    password: '12345678910'
  }).then(function(res) {
    console.log(res);
  })
})*/


//this is used to generate data to put in the db
function generateWhatText() {
  const whatText = ['Graduate Masters degree', 'install SSD drive in my laptop', 'get a new job!', 'build my own house!', 'put on 5 pounds of muscle'];
  return whatText[Math.floor(Math.random() * whatText.length)];
}

function generateWhyText() {
  const whyText = ['make more $$', 'help more people!', 'create more value', 'have a place to live', 'have a reason to go to the beach'];
  return whyText[Math.floor(Math.random() * whyText.length)];
}

function generateUserIds() {
  const userIds = ['5b1feb2737e334044ebbbcac', '6b1feb2737e334044ebbbcad'];
  return userIds[Math.floor(Math.random() * userIds.length)];
}

function generateoutcomeDate() {
  const outcomeDate = [new Date(new Date().setDate(new Date().getDate() + 5)), new Date(new Date().setDate(new Date().getDate() + 115)), new Date(new Date().setDate(new Date().getDate() + 335)), new Date(new Date().setDate(new Date().getDate() + 655))];
  return outcomeDate[Math.floor(Math.random() * outcomeDate.length)];
}

function generaterange() {
  const range = [1, 7, 30, 365, 1825];
  return range[Math.floor(Math.random() * range.length)];  
}

function generateClientProjectData() {
  
  return { 
    whatText: generateWhatText(),
    whyText: generateWhyText(),
    date: generateoutcomeDate(),
    range: generaterange(),
    user_id: generateUserIds()
  }
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('TopView API', function() {
 
  before(function() {
   return runServer(TEST_DATABASE_URL);
  });
 //these are triggered before and after each describe block
 //I was getting an error here before b/c I was passing nothing 

  beforeEach(function() {
    this.timeout(5000);
    return seedClientProjectData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('the POST endpoint', function() {
    it('should add an outcome on POST', function() {
      
      // test strategy:
      //  1. make a POST request with data for a new outcome
      //  2. inspect response object and prove it has right
      //  status code and that the returned object has an `id`
      const newOutcome = {
        whatText: 'finish thinkful',
        whyText: 'so I can get a good job and create value for myself and others',
        date: new Date(),
        range: 1825,
        user_id: 123456
      };
      return chai
      .request(app)
      .post('/outcomes')
      .send(newOutcome)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.include.keys('id', 'whatText', 'whyText', 'date', 'range', 'user_id');
        expect(res.body.id).to.not.equal(null);
      })
      .catch(err => {
        console.log(err);
      });
    }); 
  });

    describe('the GET endpoint', function() {
      //strategy: 
      //  1. get back all client projects for a given user id
      //  2. prove reponse object has the right keys
      it('should get outcomes back associated with the id passed', function() {
        return chai.request(app)
          .get('/outcomes/5b1feb2737e334044ebbbcac')
          .then(function(res) {
            res.should.have.status(200);
            res.should.be.json;
            expect(res.body.outcomesModels).to.have.lengthOf.at.least(1);
            res.body.outcomesModels.forEach(function(outcome) {
              expect(outcome).to.include.keys('id', 'user_id',
              'whatText', 'whyText', 'range', 'date');
              expect(outcome.user_id === '5b1feb2737e334044ebbbcac');
            });
          })
          .catch(err => {
            console.log(err);
          });
        });
      });
    
    
    describe('the PUT endpoint', function() {
      it('should update the fields', function() {
        const updatedOutcome = {
          whatText: 'change the update',
          whyText: 'so I can see if the update changed',
        };
        return chai.request(app)
        .put('/outcomes/5b1feb2737e334044ebbbcac')
        .send(updatedOutcome)
        .then(function(res) {
          res.should.have.status(204);
          res.should.be.json;
        expect(res.body.outcomesModels).to.have.lengthOf.at.least(1);
        expect(res.body.outcomesModels).to.include.keys('whatText', 'whyText');
        })
        .catch(err => {
          console.log(err);
        });
      });
    }); 
 
    
    describe('the DELETE endpoint', function() {
      it('should delete an outcome', function() {
        return chai.request(app)
        // first have to get so we have an `id` of item
        // to delete
        .get('/outcomes/5b1feb2737e334044ebbbcac')
        .then(function(outcome) {
          return chai.request(app)
            .delete(`/outcomes/5b1feb2737e334044ebbbcac`);
        })
        .catch(err => {
          console.log(err);
        });
      })
    })
    /*
    it('should delete items on DELETE', function() {
      return chai.request(app)
        // first have to get so we have an `id` of item
        // to delete
        .get('/outcomes/5b1feb2737e334044ebbbcac')
        .then(function(res) {
          return chai.request(app)
            .delete(`/outcomes/${res.body[0].id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        });
    });*/




});