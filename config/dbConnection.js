const mysql = require("mysql");
const dotenv = require("dotenv").config();

const connectDB = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connectDB.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Database Connected");
});

module.exports = connectDB;
