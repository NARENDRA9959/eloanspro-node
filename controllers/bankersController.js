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
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getBankersCount error");
      return res.status(500).send("Error in Fetching the Lenders Count");
    }
    const bankersCount = result[0]["bankersCount"];
    res.status(200).send(String(bankersCount));
  });
});


const getNewBankersCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as bankersCount FROM bankers";
  const queryParams = req.query;
  queryParams["bankerInternalStatus-eq"] = "1";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getBankersCount error");
      return res.status(500).send("Error in Fetching the New Lenders Count");
    }
    const bankersCount = result[0]["bankersCount"];
    res.status(200).send(String(bankersCount));
  });
});
const getBankers = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM bankers";
  const queryParams = req.query;
  queryParams["sort"] = "createdOn";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getBankers error:");
      return res.status(500).send("Error in Fetching the Lenders");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const getBanks = asyncHandler(async (req, res) => {
  let sql = "SELECT id, name, imageFiles AS imageUrl FROM bankers";
  const filtersQuery = handleGlobalFilters(req.body);
  sql += filtersQuery;
  sql += " ORDER BY name ASC";
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getBanks error:", err);
      return res.status(500).send("Error retrieving banks");
    }
    const transformedResult = result.map((bank) => ({
      ...bank,
      imageUrl: JSON.parse(bank.imageUrl),
      selected: false,
    }));
    res.status(200).send(transformedResult);
  });
});
const getBankersById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM bankers WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getBankersById error:");
      return res.status(500).send("Error in Fetching the Lender Details");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result[0]);
  });
});

const createBanker = asyncHandler((req, res) => {
  try {
    let bankerId = "B-" + generateRandomNumber(6);
    req.body["bankerId"] = bankerId;
    req.body["bankerInternalStatus"] = 1;
    req.body["lastBankerInternalStatus"] = 1;
    req.body["createdBy"] = req.user.name;
    req.body["lastUpdatedBy"] = req.user.name;
    const checkSql = `SELECT * FROM bankers WHERE name = ?`;
    dbConnect.query(checkSql, [req.body.name], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("createBanker check error:", checkErr);
        return res.status(500).send("Error in Checking the Lender");
      }
      if (checkResult.length > 0) {
        return res.status(400).send("Bank name already exists!!!");
      }
      const createClause = createClauseHandler(req.body);
      const insertSql = `INSERT INTO bankers (${createClause[0]}) VALUES (${createClause[1]})`;
      dbConnect.query(insertSql, (err, result) => {
        if (err) {
          console.error("createBanker insertion error:", err);
          return res.status(500).send("Error in Creating the Lender");
        }
        res.status(200).send(true);
      });
    });
  } catch (error) {
    console.error("createBanker unexpected error:", error);
    res.status(500).send("Error in Creating the Lender");
  }
});

const updateBanker = asyncHandler((req, res) => {
  const id = req.params.id;
  const checkRequiredFields = handleRequiredFields("bankers", req.body);
  if (!checkRequiredFields) {
    res.status(422).send("Please Fill all required fields");
    return;
  }
  req.body["lastUpdatedBy"] = req.user.name;
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE bankers SET ${updateClause} WHERE id = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("updateBanker error:");
      return res.status(500).send("Error in Updating the Lender");
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
      return res.status(500).send("Error in Updating the Lender");
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
          return res.status(500).send("Error in Updating the Lender Status");
        }
        res.status(200).send(true);
      });
    } else {
      res.status(422).send("No Bankers Found");
    }
  });
});
// const deleteBanker = asyncHandler((req, res) => {
//   const sql = `DELETE FROM bankers WHERE id = ${req.params.id}`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("deleteBanker error:");
//     }
//     res.status(200).send("Banker Deleted Successfully");
//   });
// });
const deleteBanker = asyncHandler((req, res) => {
  const sql = `DELETE FROM bankers WHERE bankerId = '${req.params.id}'`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("deleteBanker error:", err);
      return res.status(500).send("Error In Deleting the Lender");
    }
    res.status(200).json({ message: "Lender Deleted Successfully" });
  });
});
module.exports = {
  getBankers,
  getBankersCount,
  getBankersById,
  createBanker,
  getBanks,
  updateBanker,
  deleteBanker,
  changeBankersStatus,
  getNewBankersCount
};
