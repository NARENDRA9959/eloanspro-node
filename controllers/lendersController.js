const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");

const getLenders = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM lenders";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("getLenders Error in controller");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const getLendersCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as lendersCount FROM lenders";
  const filtersQuery = handleGlobalFilters(req.query, true);
  sql += filtersQuery;
  //console.log(sql)
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("Error in getLendersCount:", err);
      res.status(500).send("Internal Server Error");
    } else {
      const lendersCount = result[0]["lendersCount"];
      //console.log(lendersCount);
      res.status(200).send(String(lendersCount));
    }
  });
});
module.exports = {
  getLenders,
  getLendersCount,
};
