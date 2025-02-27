const dbConnect = require("../config/dbConnection");
const { userLogoutforIp } = require("../controllers/userController");

function isUserLoggedIn(req) {
    return req.body.username == null;
}
let allowedIPs = [];
function fetchAllowedIPs() {
    return new Promise((resolve, reject) => {
        dbConnect.query("SELECT ipAddress FROM ipaddresses", (err, results) => {
            if (err) {
                return reject(err);
            }
            const prefixes = results.map((row) =>
                row.ipAddress.split(".").slice(0, 2).join(".")
            );
            resolve(prefixes);
        });
    });
}

// async function fetchClientIP() {
//     try {
//         const response = await axios.get("https://api.ipify.org?format=json");
//         currentClientIP = response.data.ip;
//         console.log("Fetched Client IP:", currentClientIP);
//     } catch (error) {
//         console.error("Error fetching client IP:", error);
//     }
// }

async function ipWhitelist(req, res, next) {
    try {
        allowedIPs = await fetchAllowedIPs();
        // console.log(req.headers["mysystem-ip"])
        const clientIPPrefix = req.headers["mysystem-ip"].split(".").slice(0, 2).join(".");
        const isAllowed = allowedIPs.includes(clientIPPrefix);
        if (isAllowed) {
            next();
        } else {
            if (isUserLoggedIn(req)) {
                return userLogoutforIp(req, res);
            } else {
                res.status(403).send("Access denied. IP not allowed");
            }
        }
    } catch (error) {
        console.error("Error handling IP whitelist:", error);
        res.status(500).send("Internal server error");
    }
}

module.exports = ipWhitelist;
