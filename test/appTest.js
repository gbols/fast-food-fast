import chai from 'chai';
import chaiHttp from 'chai-http';
import dotenv from 'dotenv';
import Jwt from 'jsonwebtoken';
import app from '../src/app';

const should = chai.should();
dotenv.config();

chai.use(chaiHttp);
describe('/SIGNUP', () => {
  it('it should allow a user signup with  valid credentials', (done) => {
    const signup = {
      username: 'tunde',
      password: 'tunde@tunde',
      email: 'tunde@tunde.com',
      address: '4 Napier Garden Lekki Lagos',
      phone: '0810 954 8778',
    };
    chai
      .request(app)
      .post('/api/v1/auth/signup')
      .send(signup)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have
          .property('message')
          .eql('user account successfully created!....');
        res.body.should.have
          .property('success')
          .eql(true);
        res.body.should.have.property('token');
        res.body.should.have.property('details');
        done();
      });
  });

  it("it should'nt allow a user signup with the same credentials twice", (done) => {
    const signup = {
      username: 'tunde',
      password: 'tunde@tunde',
      email: 'tunde@tunde.com',
      address: '4 Napier Garden Lekki Lagos',
      phone: '0810 954 8778',
    };
    chai
      .request(app)
      .post('/api/v1/auth/signup')
      .send(signup)
      .end((err, res) => {
        res.should.have.status(409);
        res.body.should.have
          .property('message')
          .eql('user with credentials already exits');
        res.body.should.have
          .property('success')
          .eql(false);
        done();
      });
  });


  it("it should'nt allow improper input fileds", (done) => {
    const signup = {
      username: 'tunde',
      password: '',
      email: 'tunde@tunde.com',
      address: '4 Napier Garden Lekki Lagos',
      phone: '0810 954 8778',
    };
    chai
      .request(app)
      .post('/api/v1/auth/signup')
      .send(signup)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.have
          .property('message');
        res.body.should.have
          .property('success')
          .eql(false);
        done();
      });
  });
});

describe('/LOGIN', () => {
  it('it should allow a user login with credentials', (done) => {
    const log = {
      username: 'tunde',
      password: 'tunde@tunde',
    };
    chai
      .request(app)
      .post('/api/v1/auth/login')
      .send(log)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have
          .property('message')
          .eql('user successfully logged In!....');
        res.body.should.have
          .property('success')
          .eql(true);
        res.body.should.have.property('token');
        res.body.should.have.property('details');
        done();
      });
  });

  it("it should'nt allow a user login with incorrect password", (done) => {
    const log = {
      username: 'tunde',
      password: 'gbolhan',
    };
    chai
      .request(app)
      .post('/api/v1/auth/login')
      .send(log)
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have
          .property('message')
          .eql('the password dooesnt match the supplied username!...');
        res.body.should.have
          .property('success')
          .eql(false);
        done();
      });
  });

  it("it should'nt allow a user that doesnt exits to login", (done) => {
    const log = {
      username: 'dayork',
      password: 'gbolhan',
    };
    chai
      .request(app)
      .post('/api/v1/auth/login')
      .send(log)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have
          .property('message')
          .eql('user with credentails doesnt exits in the database!....');
        res.body.should.have
          .property('success')
          .eql(false);
        done();
      });
  });

  it("it should'nt allow improper input fileds", (done) => {
    const log = {
      username: '',
      password: 'gbolhan',
    };
    chai
      .request(app)
      .post('/api/v1/auth/login')
      .send(log)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.have
          .property('message');
        res.body.should.have
          .property('success')
          .eql(false);
        done();
      });
  });
});
describe('/SIGNOUT', () => {
  it('it should allow a user to signout of the app', (done) => {
    chai
      .request(app)
      .get('/api/v1/signout')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have
          .property('message')
          .eql('you have successfully signed out');
        res.body.should.have
          .property('success')
          .eql(true);
        done();
      });
  });
});

describe('/POST', () => {
  it("it should'nt allow a user without token access this route", (done) => {
    const order = {
      description: 'Egg and Bread',
      price: 800,
      quantity: 5,
    };
    chai
      .request(app)
      .post('/api/v1/order')
      .send(order)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.have
          .property('message')
          .eql('Forbidden!,valid token needed to access route');
        res.body.should.have
          .property('success')
          .eql(false);
        done();
      });
  });

  it("it should'nt allow a invalid input fields", (done) => {
    const order = {
      description: '',
      price: 800,
      quantity: 5,
    };
    chai
      .request(app)
      .post('/api/v1/order')
      .set('Authorization', `Bearer ${Jwt.sign({ userid: 2 }, process.env.JWT_SECRET)}`)
      .send(order)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have
          .property('message');
        res.body.should.have
          .property('success')
          .eql(false);
        done();
      });
  });

  it('it should create a post with valid credentials', (done) => {
    const user = {
      userid: 2,
    };
    const order = {
      description: 'Yam and Egg',
      price: 800,
      quantity: 5,
    };
    chai
      .request(app)
      .post('/api/v1/order')
      .set('Authorization', `Bearer ${Jwt.sign({ user }, process.env.JWT_SECRET)}`)
      .send(order)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have
          .property('message').eql('order was succesfully created');
        res.body.should.have
          .property('success')
          .eql(true);
        res.body.should.have
          .property('order');
        done();
      });
  });
});
