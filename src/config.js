import dotenv from 'dotenv';

dotenv.config();

const dbConfiguration = {
  development: {
    user: process.env.MAN,
    host: process.env.HOST,
    database: process.env.DATABASE_DEVELOPMENT,
    password: process.env.PASSWORD,
    port: process.env.PORTER,
  },

  testing: {
    user: process.env.MAN,
    host: process.env.HOST,
    database: process.env.DATABASE_TEST,
    password: process.env.PASSWORD,
    port: process.env.PORTER,

  },

  heroku: {
    connectionString: process.env.TEST_DATABASE_URL,
  },
};

export default dbConfiguration;
