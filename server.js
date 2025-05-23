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

// const express = require("express");
// const http = require('http');
// const cors = require("cors");
// const path = require("path");
// const applyIpWhitelist = require('./middleware/ipAddress.js');

// const app = express();
// app.use(express.json());

// const { scheduleCronJobs } = require('./controllers/nodemail.js');
// const authMiddleware = require("./middleware/verifySuperAdmin.js");

// app.use(cors({ origin: "*" }));

// // ✅ Create HTTP server and attach app
// const server = http.createServer(app);

// // ✅ Initialize socket.io on same HTTP server
// const { Server } = require('socket.io');
// const io = new Server(server, {
//   cors: { origin: "*" }
// });

// // ✅ Export io and superAdminSockets globally if needed elsewhere
// global.io = io;
// global.superAdminSockets = {};

// io.on('connection', (socket) => {
//   const userType = socket.handshake.query.userType;
//   const userId = socket.handshake.query.userId;

//   console.log(`🔗 Socket connected: ${socket.id}, userType: ${userType}, userId: ${userId}`);

//   if (userType == 1) {
//     // Remove previous socket for this userId if it exists
//     for (let key in superAdminSockets) {
//       if (superAdminSockets[key].userId == userId) {
//         delete superAdminSockets[key];
//         break;
//       }
//     }

//     // Register new Super Admin socket
//     superAdminSockets[socket.id] = { socket, userId };
//     console.log(`Registered Super Admin: ${socket.id}`);
//   }

//   socket.on('disconnect', () => {
//     delete superAdminSockets[socket.id];
//     console.log('❌ Socket disconnected:', socket.id);
//   });
// });

// // ✅ Routes
// app.use("/user", require("./routes/userRoutes"));
// app.use("/leads", applyIpWhitelist, authMiddleware, require("./routes/leadsRoutes"));
// app.use("/loanleads", applyIpWhitelist, authMiddleware, require("./routes/loanLeadsRoutes.js"));
// app.use("/callbacks", applyIpWhitelist, authMiddleware, require("./routes/callbackRoutes"));
// app.use("/files", applyIpWhitelist, authMiddleware, require("./routes/fileHandlerRoutes"));
// app.use("/counts", applyIpWhitelist, authMiddleware, require("./routes/allCountRoutes"));
// app.use("/users", applyIpWhitelist, authMiddleware, require("./routes/teamRoutes"));
// app.use("/logins", applyIpWhitelist, authMiddleware, require("./routes/loginsRoutes"));
// app.use("/reports", applyIpWhitelist, authMiddleware, require("./routes/reportsRoutes"));
// app.use("/bankers", applyIpWhitelist, authMiddleware, require("./routes/bankersRoutes"));
// app.use("/createTable", applyIpWhitelist, authMiddleware, require("./routes/createTableRoutes"));
// app.use("/ipAddress", applyIpWhitelist, authMiddleware, require("./routes/ipAddressRoutes.js"));
// app.use("/uploads", applyIpWhitelist, authMiddleware, express.static(path.join(__dirname, "uploads")));

// // scheduleCronJobs();
// // ✅ Start HTTP server and socket.io together
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 HTTP Server & Socket.IO running on http://localhost:${PORT}`);
// });
