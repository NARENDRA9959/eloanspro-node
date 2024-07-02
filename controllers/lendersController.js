const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const { generateRandomNumber } = require("../middleware/valueGenerator");


const {
  createClauseHandler,
  updateClauseHandler,
} = require("../middleware/clauseHandler");
const getLenders = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM lenders";
  const queryParams = req.query;
  queryParams["sort"] = "createdOn";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
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
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("Error in getLendersCount:", err);
      res.status(500).send("Internal Server Error");
    } else {
      const lendersCount = result[0]["lendersCount"];
      res.status(200).send(String(lendersCount));
    }
  });
});

const getLenderById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM lenders WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getLenderById error in controller");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const createLender = asyncHandler((req, res) => {
  let lenderId = "E-" + generateRandomNumber(6);
  req.body["lenderId"] = lenderId;
  req.body["lenderInternalStatus"] = 1;
  req.body["lastlenderInternalStatus"] = 1;
  req.body["createdBy"] = req.user.name;
  const createClause = createClauseHandler(req.body);
  const sql = `INSERT INTO lenders (${createClause[0]}) VALUES (${createClause[1]})`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("createLender error:");
    }
    res.status(200).send(true);
  });
});

const updatelenders = asyncHandler((req, res) => {
  const id = req.params.id;
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE lenders SET ${updateClause} WHERE id = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("updatelenders error:");
    }
    res.status(200).send(result);
  });
});
const changeLenderStatus = asyncHandler((req, res) => {
  const id = req.params.lenderId;
  const statusId = req.params.statusId;
  const createSql = `SELECT * FROM lenders WHERE id = ${id}`;
  dbConnect.query(createSql, (err, result) => {
    if (err) {
      console.log("changeLenderStatus error:");
    }
    if (result && result[0] && statusId) {
      let statusData = {
        lastlenderInternalStatus: result[0].lenderInternalStatus,
        lenderInternalStatus: statusId,
      };
      const updateClause = updateClauseHandler(statusData);
      const sql = `UPDATE lenders SET ${updateClause} WHERE id = ${id}`;
      dbConnect.query(sql, (err, result) => {
        if (err) {
          console.log("changeLenderStatus and updatecalss error:");
        }
        res.status(200).send(true);
      });
    } else {
      res.status(422).send("No lenders Found");
    }
  });
});
module.exports = {
  getLenders,
  getLendersCount,
  getLenderById,
  createLender,
  updatelenders,
  changeLenderStatus
};
