const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors({
  origin: '*'
}));

app.use("/events", require("./routes/eventsRoutes"));

app.use("/user", require("./routes/userRoutes"));

app.use("/faculty", require("./routes/facultyRoutes"));

app.use("/notice", require("./routes/noticeRoutes"));

app.listen(process.env.PORT, () => {
  console.log("Server Running Peacefully");
});
