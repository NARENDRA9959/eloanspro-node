// const axios = require("axios");
// const dbConnect = require("../config/dbConnection");
// const { userLogoutforIp } = require("../controllers/userController");

// function isUserLoggedIn(req) {
//     // console.log(req)
//     // console.log(req.body)
//     return req.body.username == null;
// }
// let allowedIPs = [];
// let currentClientIP = "";
// function fetchAllowedIPs() {
//     return new Promise((resolve, reject) => {
//         dbConnect.query("SELECT ipAddress FROM ipaddresses", (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             const prefixes = results.map((row) =>
//                 row.ipAddress.split(".").slice(0, 2).join(".")
//             );
//             resolve(prefixes);
//         });
//     });
// }

// async function fetchClientIP() {
//     try {
//         const response = await axios.get("https://api.ipify.org?format=json");
//         currentClientIP = response.data.ip;
//         console.log("Fetched Client IP:", currentClientIP);
//     } catch (error) {
//         console.error("Error fetching client IP:", error);
//     }
// }

// async function updateIPData() {
//     try {
//         allowedIPs = await fetchAllowedIPs();
//         console.log("Updated allowed IP prefixes:", allowedIPs);
//         await fetchClientIP();
//     } catch (err) {
//         console.error("Failed to fetch allowed IPs or client IP:", err);
//     }
// }

// updateIPData();
// setInterval(fetchClientIP, 60000);
// setInterval(updateIPData, 60000);
// async function ipWhitelist(req, res, next) {
//     try {
//         if (!currentClientIP) {
//             await fetchClientIP();
//         }
//         const clientIPPrefix = currentClientIP.split(".").slice(0, 2).join(".");
//         console.log("Client IP Prefix:", clientIPPrefix);
//         const isAllowed = allowedIPs.includes(clientIPPrefix);
//         console.log("Allowed IP Prefixes:", allowedIPs);
//         console.log("Is Allowed:", isAllowed);
//         if (isAllowed) {
//             next();
//         } else {
//             console.log("Access denied. IP not allowed:", currentClientIP);
//             if (isUserLoggedIn(req)) {
//                 return userLogoutforIp(req, res);
//             } else {
//                 res.status(403).send("Access denied. IP not allowed");
//             }
//         }
//     } catch (error) {
//         console.error("Error handling IP whitelist:", error);
//         res.status(500).send("Internal server error");
//     }
// }

// module.exports = ipWhitelist;
