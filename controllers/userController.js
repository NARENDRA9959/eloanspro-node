const dbConnect = require("../config/dbConnection");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const adminLogin = asyncHandler(async (req, res) => {
  const { username, password, type } = req.body;
  if (!username || !password || !type) {
    res.status(400).send("Please Enter Username and Password");
  }
  const sql = `SELECT * FROM admin WHERE email = "${username}" OR name = "${username}"`;
  dbConnect.query(sql, async (err, result) => {
    if (err) {
      //throw err;
      console.log("adminlogin error in controller");
    }
    if (
      result &&
      result.length == 1 &&
      (await bcrypt.compare(password, result[0].password))
    ) {
      const user = result[0];
      //console.log(result);
      //console.log(type);
      const accessToken = jwt.sign(
        {
          user: {
            id: user.id,
            username: user.name,
            email: user.email,
            type: type,
          },
        },
        
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );
     // console.log(accessToken),
      res.status(200).json({ accessToken });
    } else {
      res.status(401).send("Username or Password Incorrect");
    }
  });
});

// const userLogin = asyncHandler(async (req, res) => {
//   const { id, phone } = req.body;

//   // Check if id or phone is missing
//   if (!id || !phone) {
//     return res.status(400).send("Please Enter User ID and Phone Number");
//   }

//   // SQL query using parameterized inputs to prevent SQL injection
//   const sql = 'SELECT * FROM users WHERE id = ?';
//   dbConnect.query(sql, [id], (err, result) => {
//     if (err) {
//       console.error("userLogin error in controller:", err);
//       return res.status(500).send("Internal Server Error");
//     }

//     // Check if the user exists and the phone number matches
//     if (result && result.length === 1 && result[0].phone === phone) {
//       const user = result[0];
//       const accessToken = jwt.sign(
//         {
//           user: {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//           },
//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         { expiresIn: "30m" }
//       );
//       return res.status(200).json({ accessToken });
//     } else {
//       return res.status(401).send("User ID or Phone Number Incorrect");
//     }
//   });
// });


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

module.exports = { adminLogin, userLogout };
