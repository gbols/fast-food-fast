import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken';
import Joi from 'joi';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'zainab1#',
  port: 5432,
});

const signUp = async (req, res) => {
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(4).max(30)
      .required(),
    email: Joi.string().email({ minDomainAtoms: 1 }).required(),
    address: Joi.string().required(),
    password: Joi.string().required(),
    phone: Joi.number().required(),
  });
  const { error } = Joi.validate(req.body, schema);
  if (error) {
    return res.status(403).send({ success: false, message: error.message });
  }
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT * FROM users WHERE username = $1', [req.body.username]);
    if (rows[0]) {
      return res.status(200).send({ success: false, message: 'user with credentials already exits' });
    }

    const hash = bcrypt.hashSync(req.body.password, 1);
    const result = await client.query('INSERT INTO users  (username,email,address,password,phone) VALUES ($1, $2, $3, $4, $5) RETURNING *', [req.body.username, req.body.email, req.body.address, hash, req.body.phone]);
    const token = Jwt.sign({ user: result.rows[0] }, 'luapnahalobgujnugalo');
    res.status(200).send({
      success: true, message: 'user account successfully created!....', details: result.rows[0], token,
    });
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.release();
  }
};

const login = async (req, res) => {
  const schema = {
    username: Joi.string().required(),
    password: Joi.string().required(),
  };
  const { error } = Joi.validate(req.body, schema);
  if (error) {
    return res.status(403).send({ success: false, message: error.message });
  }
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT * FROM users WHERE username = $1', [req.body.username]);
    if (!rows[0]) {
      return res.status(404).send({ success: false, message: 'user with credentails doesnt exits in the database!....' });
    }
    const correctPassword = bcrypt.compareSync(req.body.password, rows[0].password);
    if (!correctPassword) {
      return res.status(400).send({ success: false, message: 'the password dooesnt match the supplied username!...' });
    }
    const token = Jwt.sign({ user: rows[0] }, 'luapnahalobgujnugalo');
    res.status(200).send({
      success: true, message: 'user successfully logged In!....', details: rows[0], token,
    });
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.release();
  }
};

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (!bearerHeader) return res.status(403).send('Forbidden! ....');
  const bearer = bearerHeader.split(' ');
  const bearerToken = bearer[1];
  req.token = bearerToken;
  next();
};

const signOut = (req, res) => {
  res.status(200).send({ success: true, message: 'you have successfully signed out' });
};

export {
  signUp, login, verifyToken, signOut,
};
