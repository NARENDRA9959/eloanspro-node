const express = require("express");
const https = require('https');
const cors = require("cors");
const path = require("path");
const app = express();
const fs = require('fs');
const ipWhitelist = require('./middleware/ipAddress.js');

app.use(express.json());

// const { scheduleCronJobs } = require('./controllers/nodemail.js');
app.use(
  cors({
    origin: "*",
  })
);

const options = {
  key: fs.readFileSync('./ssl/privkey.pem'),
  cert: fs.readFileSync('./ssl/cert.pem'),
  ca: fs.readFileSync('./ssl/chain.pem')
};


app.use("/user", ipWhitelist, require("./routes/userRoutes"));
app.use("/leads", ipWhitelist, require("./routes/leadsRoutes"));
app.use("/loanleads", ipWhitelist, require("./routes/loanLeadsRoutes.js"));
app.use("/callbacks", ipWhitelist, require("./routes/callbackRoutes"));
app.use("/files", ipWhitelist, require("./routes/fileHandlerRoutes"));
app.use("/counts", ipWhitelist, require("./routes/allCountRoutes"));
app.use("/users", ipWhitelist, require("./routes/teamRoutes"));
app.use("/logins", ipWhitelist, require("./routes/loginsRoutes"));
app.use("/reports", ipWhitelist, require("./routes/reportsRoutes"));
app.use("/bankers", ipWhitelist, require("./routes/bankersRoutes"));
app.use("/createTable", ipWhitelist, require("./routes/createTableRoutes"));
app.use("/ipAddress", ipWhitelist, require("./routes/ipAddressRoutes.js"));
app.use("/uploads", ipWhitelist, express.static(path.join(__dirname, "uploads")));

// scheduleCronJobs();
// console.log(process.env.PORT)
// app.listen(process.env.PORT, () => {
//   console.log("Server Running Peacefully");
// });
https.createServer(options, app).listen(process.env.PORT, () => {
  console.log(`HTTPS Server running on port ${process.env.PORT}`);
});
