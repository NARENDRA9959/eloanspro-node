const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use("/user", require("./routes/userRoutes"));
app.use("/leads", require("./routes/leadsRoutes"));
app.use("/callbacks", require("./routes/callbackRoutes"));
app.use("/files", require("./routes/fileHandlerRoutes"));
app.use("/counts", require("./routes/allCountRoutes"));
app.use("/users", require("./routes/teamRoutes"));
app.use("/logins", require("./routes/loginsRoutes"));
app.use("/lenders", require("./routes/lenderRoutes"));
app.use("/bankdocuments", require("./routes/bankDocumentsRoutes"));
app.use("/bankers", require("./routes/bankersRoutes"));
app.use("/createTable", require("./routes/createTableRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use('/download', express.static(path.join(__dirname, 'downloads')));
app.listen(process.env.PORT, () => {
  console.log("Server Running Peacefully");
});
