const express = require("express");

const app = express();
app.use(express.json());

const port = 5000;

app.use("/events", require("./routes/eventsRoutes"));

app.use("/login", require("./routes/userRoutes"));

app.use("/faculty",require("./routes/facultyRoutes"))

app.use("/notice",require("./routes/noticeRoutes"))
app.listen(port, () => {
  console.log("Server Running Peacefully");
});
