const dbConnect = require("../config/dbConnection");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; 
    if (!token) {
        return res.status(401).send("Unauthorized - No Token Provided");
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded.user; 
        if (req.user.userType !== "1") {
            return next();
        }
        const sql = `SELECT token FROM users WHERE id = ? `;
        dbConnect.query(sql, [req.user.id], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).send("Server Error");
            }
            if (!result.length || result[0].token !== token) {
                return res.status(401).send("Session Expired. Please log in again.");
            }
            next(); 
        });
    } catch (error) {
        return res.status(401).send("Invalid Token");
    }
};

module.exports = authMiddleware;
