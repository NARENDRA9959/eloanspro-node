const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const {
  createClauseHandler,
  updateClauseHandler,
} = require("../middleware/clauseHandler");
const handleRequiredFields = require("../middleware/requiredFieldsChecker");
const { generateRandomNumber } = require("../middleware/valueGenerator");

const getBankersCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as bankersCount FROM bankers";
  const filtersQuery = handleGlobalFilters(req.query, true);
  //console.log(filtersQuery)
  sql += filtersQuery;
  //console.log(sql);
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getBankersCount error");
    }
    const bankersCount = result[0]["bankersCount"];
    //console.log(bankersCount)
    res.status(200).send(String(bankersCount));
  });
});

const getBankers = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM bankers";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getBankers error:");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const getBankersById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM bankers WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getBankersById error:");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result[0]);
  });
});

const createBanker = asyncHandler((req, res) => {
  let bankerId = "B-" + generateRandomNumber(6);
  req.body["bankerId"] = bankerId;
  req.body["bankerInternalStatus"] = 1;
  req.body["lastBankerInternalStatus"] = 1;

  const createClause = createClauseHandler(req.body);
  const sql = `INSERT INTO bankers (${createClause[0]}) VALUES (${createClause[1]})`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("createBanker error:");
    }
    res.status(200).send(true);
  });
});

const updateBanker = asyncHandler((req, res) => {
  const id = req.params.id;
  const checkRequiredFields = handleRequiredFields("bankers", req.body);
  if (!checkRequiredFields) {
    res.status(422).send("Please Fill all required fields");
    return;
  }
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE bankers SET ${updateClause} WHERE id = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("updateBanker error:");
    }
    res.status(200).send(result);
  });
});

const changeBankersStatus = asyncHandler((req, res) => {
  const id = req.params.bankerId;
  const statusId = req.params.statusId;
  const createSql = `SELECT * FROM bankers WHERE id = ${id}`;
  dbConnect.query(createSql, (err, result) => {
    if (err) {
      console.log("changeBankersStatus error:");
    }
    if (result && result[0] && statusId) {
      let statusData = {
        lastBankerInternalStatus: result[0].bankerInternalStatus,
        bankerInternalStatus: statusId,
      };
      const updateClause = updateClauseHandler(statusData);
      const sql = `UPDATE bankers SET ${updateClause} WHERE id = ${id}`;
      dbConnect.query(sql, (err, result) => {
        if (err) {
          console.log("changeBankersStatus and updatecalss error:");
        }
        res.status(200).send(true);
      });
    } else {
      res.status(422).send("No Bankers Found");
    }
  });
});

const deleteBanker = asyncHandler((req, res) => {
  const sql = `DELETE FROM bankers WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("deleteBanker error:");
    }
    res.status(200).send("Banker Deleted Successfully");
  });
});

module.exports = {
  getBankers,
  getBankersCount,
  getBankersById,
  createBanker,
  updateBanker,
  deleteBanker,
  changeBankersStatus,
};
