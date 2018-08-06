const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require("../server");

const should = chai.should();
chai.use(chaiHttp);

const expect = chai.expect;

describe('LongGame API', function() {

  /*
  it('should 200 on GET requests', function() {
    return chai.request(app)
      .get('/api/fooooo')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
    });
  });
  */
  

 before(function() {
   return runServer();
 });

 after(function() {
   return closeServer();
 });
  
  // test strategy:
  //  1. make a POST request with data for a new outcome
  //  2. inspect response object and prove it has right
  //  status code and that the returned object has an `id`

  it('should add an outcome on POST', function() {
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
      expect(res.body).to.include.keys('id', 'whatText', 'whyText', 'date', 'range', 'user_id', 'editing', 'showDetail');
      expect(res.body.id).to.not.equal(null);
    });
  }); 
});