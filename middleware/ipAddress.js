// const ip = require('ip');
// const dbConnect = require('../config/dbConnection');
// let allowedIPs = [];
// function fetchAllowedIPs() {
//     return new Promise((resolve, reject) => {
//         dbConnect.query('SELECT ipAddress FROM ipaddresses', (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             const allowedIPs = results.map(row => row.ipAddress);
//             resolve(allowedIPs);
//         });
//     });
// }
// async function updateAllowedIPs() {
//     try {
//         allowedIPs = await fetchAllowedIPs();
//     } catch (err) {
//         console.error('Failed to fetch allowed IPs:', err);
//     }
// }
// updateAllowedIPs();
// setInterval(updateAllowedIPs, 60000);
// function ipWhitelist(req, res, next) {
//     const serverIP = ip.address();
//     console.log('Server IP:', serverIP);
//     console.log('Allowed IPs:', allowedIPs);
//     const isAllowed = allowedIPs.includes(serverIP.trim());
//     if (isAllowed) {
//         next();
//     } else {
//         res.status(403).send('Access denied');
//     }
// }
// module.exports = ipWhitelist;
