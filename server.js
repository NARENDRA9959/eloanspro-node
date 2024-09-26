const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(express.json());
// const { scheduleCronJobs } = require('./controllers/nodemail.js');
//const ipWhitelist = require('./middleware/ipAddress');
app.use(
  cors({
    origin: "*",
  })
);
// app.use(ipWhitelist);
// app.use("/user", ipWhitelist, require("./routes/userRoutes"));
// app.use("/leads", ipWhitelist, require("./routes/leadsRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/leads", require("./routes/leadsRoutes"));
app.use("/loanleads", require("./routes/loanLeadsRoutes.js"));
app.use("/callbacks", require("./routes/callbackRoutes"));
app.use("/files", require("./routes/fileHandlerRoutes"));
app.use("/counts", require("./routes/allCountRoutes"));
app.use("/users", require("./routes/teamRoutes"));
app.use("/logins", require("./routes/loginsRoutes"));
// app.use("/lenders", require("./routes/lenderRoutes"));
app.use("/reports", require("./routes/reportsRoutes"));
// app.use("/bankdocuments", require("./routes/bankDocumentsRoutes"));
app.use("/bankers", require("./routes/bankersRoutes"));
app.use("/createTable", require("./routes/createTableRoutes"));
app.use("/ipAddress", require("./routes/ipAddressRoutes.js"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// scheduleCronJobs();
//console.log(process.env.PORT)
app.listen(process.env.PORT, () => {
  console.log("Server Running Peacefully");
});
