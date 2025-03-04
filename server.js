const express = require("express");
const https = require('https');
const cors = require("cors");
const path = require("path");
const app = express();
const fs = require('fs');
const applyIpWhitelist = require('./middleware/ipAddress.js');

app.use(express.json());

const { scheduleCronJobs } = require('./controllers/nodemail.js');
const authMiddleware = require("./middleware/verifySuperAdmin.js");
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


app.use("/user", require("./routes/userRoutes"));
app.use("/leads", applyIpWhitelist, authMiddleware, require("./routes/leadsRoutes"));
app.use("/loanleads", applyIpWhitelist, authMiddleware, require("./routes/loanLeadsRoutes.js"));
app.use("/callbacks", applyIpWhitelist, authMiddleware, require("./routes/callbackRoutes"));
app.use("/files", applyIpWhitelist, authMiddleware, require("./routes/fileHandlerRoutes"));
app.use("/counts", applyIpWhitelist, authMiddleware, require("./routes/allCountRoutes"));
app.use("/users", applyIpWhitelist, authMiddleware, require("./routes/teamRoutes"));
app.use("/logins", applyIpWhitelist, authMiddleware, require("./routes/loginsRoutes"));
app.use("/reports", applyIpWhitelist, authMiddleware, require("./routes/reportsRoutes"));
app.use("/bankers", applyIpWhitelist, authMiddleware, require("./routes/bankersRoutes"));
app.use("/createTable", applyIpWhitelist, authMiddleware, require("./routes/createTableRoutes"));
app.use("/ipAddress", applyIpWhitelist, authMiddleware, require("./routes/ipAddressRoutes.js"));
app.use("/uploads", applyIpWhitelist, authMiddleware, express.static(path.join(__dirname, "uploads")));

scheduleCronJobs();
// console.log(process.env.PORT)
// app.listen(process.env.PORT, () => {
//   console.log("Server Running Peacefully");
// });
https.createServer(options, app).listen(process.env.PORT, () => {
  console.log(`HTTPS Server running on port ${process.env.PORT}`);
});
