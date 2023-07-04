const dbConnect = require("../config/dbConnection");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400);
    throw new Error("Please Enter Username and Password");
  }
  const sql = `SELECT * FROM admin WHERE email = "${username}" OR name = "${username}"`;
  dbConnect.query(sql, async (err, result) => {
    if (err) {
      throw err;
    }
    if (
      result &&
      result.length == 1 &&
      (await bcrypt.compare(password, result[0].password))
    ) {
      const user = result[0];
      const accessToken = jwt.sign(
        {
          user: {
            id: user.id,
            username: user.name,
            email: user.email,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );
      res.status(200).json({ accessToken });
    } else {
      res.status(401).send("Username or Password Incorrect");
      //   throw new Error("Username or Password Incorrect");
    }
  });
});

module.exports = userLogin;
