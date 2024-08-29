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
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

// const getBanks = asyncHandler(async (req, res) => {
//   let sql = "SELECT id, name, imageFiles AS imageUrl FROM bankers";
//   const filtersQuery = handleGlobalFilters(req.body); // Assuming handleGlobalFilters is defined elsewhere
//   sql += filtersQuery;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("getBankers error:", err);
//       return res.status(500).send("Error retrieving bankers");
//     }
//     const transformedResult = result.map((bank) => ({
//       ...bank,
//       imageUrl: JSON.parse(bank.imageUrl),
//       selected: false,

//     }));
//     res.status(200).send(transformedResult);
//   });
// });

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
    }
    result = parseNestedJSON(result);
    res.status(200).send(result[0]);
  });
});
// const createBanker = asyncHandler((req, res) => {
//   let bankerId = "B-" + generateRandomNumber(6);
//   req.body["bankerId"] = bankerId;
//   req.body["bankerInternalStatus"] = 1;
//   req.body["lastBankerInternalStatus"] = 1;
//   console.log(req)
// console.log(req.body)
//   const createClause = createClauseHandler(req.body);
//   console.log(createClause)
//   const sql = `INSERT INTO bankers (${createClause[0]}) VALUES (${createClause[1]})`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("createBanker error:");
//     }
//     res.status(200).send(true);
//   });
// });

const createBanker = asyncHandler((req, res) => {
  try {
    let bankerId = "B-" + generateRandomNumber(6);
    req.body["bankerId"] = bankerId;
    req.body["bankerInternalStatus"] = 1;
    req.body["lastBankerInternalStatus"] = 1;
    req.body["lastUpdatedBy"] = req.user.name;

    const checkSql = `SELECT * FROM bankers WHERE name = ?`;
    dbConnect.query(checkSql, [req.body.name], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("createBanker check error:", checkErr);
        return res.status(500).send({ error: "Database check error" });
      }

      if (checkResult.length > 0) {
        return res.status(400).send("Bank name already exists!!!");
      }
      const createClause = createClauseHandler(req.body);
      const insertSql = `INSERT INTO bankers (${createClause[0]}) VALUES (${createClause[1]})`;
      dbConnect.query(insertSql, (err, result) => {
        if (err) {
          console.error("createBanker insertion error:", err);
          return res.status(500).send({ error: "Database insertion error" });
        }
        res.status(200).send(true);
      });
    });
  } catch (error) {
    console.error("createBanker unexpected error:", error);
    res.status(500).send({ error: "Unexpected server error" });
  }
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


// const getBankRevenueValue = asyncHandler(async (req, res) => {
//   if (!req.params.id) {
//     return res.status(400).send("bankid is required");
//   }

//   const bankid = req.params.id;
//   let sql = `SELECT bankRevenueValue FROM bankers WHERE id = ${dbConnect.escape(bankid)}`;

//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("getBankRevenueValue error:", err);
//       return res.status(500).send("An error occurred while retrieving the bank revenue value.");
//     }

//     if (result.length === 0) {
//       return res.status(404).send("Bank not found");
//     }
//     const bankRevenueValue = result[0].bankRevenueValue;
//     res.status(200).send(bankRevenueValue);
//   });
// });


module.exports = {
  getBankers,
  getBankersCount,
  getBankersById,
  createBanker,
  getBanks,
  updateBanker,
  deleteBanker,
  changeBankersStatus,
  //getBankRevenueValue,
  getNewBankersCount
};
