const dbConnect = require("../config/dbConnection");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send("Please Enter Username and Password");
  }
  const sql = `SELECT * FROM users WHERE email = "${username}" OR name = "${username}"`;
  //console.log("correct")
  dbConnect.query(sql, async (err, result) => {
    if (err) {
      //throw err;
      console.log("adminlogin error in controller");
    }
    // console.log(result)
    if (
      result &&
      result.length == 1 &&
      (await bcrypt.compare(password, result[0].password))
    ) {
      const user = result[0];
      //console.log(result);
      const accessToken = jwt.sign(
        {
          user: user,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10h" }
      );
      // console.log(user);
      //console.log(accessToken);
      res.status(200).json({ accessToken });
    } else {
      res.status(401).send("Username or Password Incorrect");
    }
  });
});
const userLogout = asyncHandler(async (req, res) => {
  const expiredToken = (
    req.headers.authorization || req.headers.Authorization
  ).replace("Bearer ", "");
  const decodedToken = jwt.decode(expiredToken);
  decodedToken.exp = Math.floor(Date.now() / 1000) - 60;
  const invalidatedToken = jwt.sign(
    decodedToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  res.status(200).json({ message: "Logout successful" });
});
module.exports = { userLogout, userLogin };
