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
const { getSourceName } = require('../controllers/leadsController');
const getCallBacksCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as callBacksCount FROM callbacks";
  const filtersQuery = handleGlobalFilters(req.query, true);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getCallBacksCount error");
      return res.status(500).send("Error in Fetching the Callbacks Count");
    }
    const callBacksCount = result[0]["callBacksCount"];
    res.status(200).send(String(callBacksCount));
  });
});

const getCallBacks = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM callbacks";
  const queryParams = req.query;
  queryParams["sort"] = "createdOn";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getCallBacks error:");
      return res.status(500).send("Error in Fetching the Callbacks");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const getCallBackById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM callbacks WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getCallBackById error:");
      return res.status(500).send("Error in Fetching the Callback Details");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result[0]);
  });
});


const createCallBack = asyncHandler(async (req, res) => {
  const phoneNumber = req.body.phone;
  const checkPhoneQuery = `SELECT * FROM callbacks WHERE phone = ?`;
  dbConnect.query(checkPhoneQuery, [phoneNumber], async (err, result) => {
    if (err) {
      console.error("Error checking phone number:", err);
      return res.status(500).send("Error in Checking Phone Number");
    } else {
      if (result.length > 0) {
        const callback = result[0];
        try {
          const sourcedByName = await getSourceName(callback.sourcedBy);
          return res.status(400).send(
            `Callback already exists with phone number ${phoneNumber}, 
           Callback ID - ${callback.callBackId}, Business Name - ${callback.businessName}, 
           Created By - ${callback.createdBy},  Sourced By - ${sourcedByName}`
          );
        } catch (error) {
          console.error("Error fetching sourcedBy name:", error);
          return res.status(500).send("Error fetching sourcedBy name");
        }
      } else {
        let callBackId = "C-" + generateRandomNumber(6);
        req.body["callBackId"] = callBackId;
        req.body["callbackInternalStatus"] = 1;
        req.body["lastcallbackInternalStatus"] = 1;
        req.body["createdBy"] = req.user.name;
        req.body["lastUpdatedBy"] = req.user.name;
        const createClause = createClauseHandler(req.body);
        const sql = `INSERT INTO callbacks (${createClause[0]}) VALUES (${createClause[1]})`;
        dbConnect.query(sql, (err, result) => {
          if (err) {
            console.log("createCallBack error:");
            return res.status(500).send("Error in Creating the Callback");
          }
          res.status(200).send(true);
        });
      }
    }
  });
});

const updateCallBack = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { phone } = req.body;
  const checkRequiredFields = handleRequiredFields("callbacks", req.body);
  if (!checkRequiredFields) {
    return res.status(422).send("Please fill all required fields");
  }
  const checkPhoneQuery = `SELECT * FROM callbacks WHERE phone = ? AND id != ?`;
  dbConnect.query(checkPhoneQuery, [phone, id], async (err, result) => {
    if (err) {
      console.error("Error checking phone number:", err);
      return res.status(500).send("Error in Checking Phone Number");
    }
    if (result.length > 0) {
      const callback = result[0];
      try {
        const sourcedByName = await getSourceName(callback.sourcedBy);
        return res.status(400).send(
          `Callback already exists with phone number ${phone}, 
         Callback ID - ${callback.callBackId}, Business Name - ${callback.businessName}, 
         Created By - ${callback.createdBy},  Sourced By - ${sourcedByName}`
        );
      } catch (error) {
        console.error("Error fetching sourcedBy name:", error);
        return res.status(500).send("Error fetching sourcedBy name");
      }
    }
    req.body["lastUpdatedBy"] = req.user.name;
    const updateClause = updateClauseHandler(req.body);
    const updateSql = `UPDATE callbacks SET ${updateClause} WHERE id = ?`;
    dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("updateCallBack error:", updateErr);
        return res.status(500).send("Error in Updating the Callback");
      }
      return res.status(200).send(updateResult);
    });
  });
});


const changeCallbackStatus = asyncHandler((req, res) => {
  const id = req.params.callBackId;
  const statusId = req.params.statusId;
  const createSql = `SELECT * FROM callbacks WHERE id = ${id}`;
  dbConnect.query(createSql, (err, result) => {
    if (err) {
      console.log("changeCallbackStatus error:");
      return res.status(500).send("Error in Updating the Callback");
    }
    if (result && result[0] && statusId) {
      let statusData = {
        lastCallbackInternalStatus: result[0].callbackInternalStatus,
        callbackInternalStatus: statusId,
      };
      const updateClause = updateClauseHandler(statusData);
      const sql = `UPDATE callbacks SET ${updateClause} WHERE id = ${id}`;
      dbConnect.query(sql, (err, result) => {
        if (err) {
          console.log("changeCallbackStatus and updatecalss error:");
          return res.status(500).send("Error in Updating the Callback Status");
        }
        res.status(200).send(true);
      });
    } else {
      res.status(422).send("No Callbacks Found");
    }
  });
});
// const deleteCallBack = asyncHandler((req, res) => {
//   const sql = `DELETE FROM callbacks WHERE id = ${req.params.id}`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("deleteCallBack error:");
//     }
//     res.status(200).send("Callback Deleted Successfully");
//   });
// });
const deleteCallBack = asyncHandler((req, res) => {
  const sql = `DELETE FROM callbacks WHERE callBackId = '${req.params.id}'`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("deleteCallBack error:", err);
      return res.status(500).send("Error In Deleting the Callback");
    }
    res.status(200).json({ message: "Callback Deleted Successfully" });
  });
});



const getTotalCallbacksCountArray = asyncHandler(async (req, res) => {
  let sql = `
      SELECT 
      SUM(CASE WHEN loanType = 'businessLoan' THEN 1 ELSE 0 END) AS businessCount,
          SUM(CASE WHEN loanType = 'personalLoan' THEN 1 ELSE 0 END) AS personalCount,
          SUM(CASE WHEN loanType = 'homeLoan' THEN 1 ELSE 0 END) AS homeLoanCount,
          SUM(CASE WHEN loanType = 'lap' THEN 1 ELSE 0 END) AS lapLoanCount
      FROM callbacks
  `;
  const queryParams = req.query;
  const filtersQuery = handleGlobalFilters(queryParams, true);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getTotalCallbacksCountArray error in controller", err);
      return res.status(500).send("Error in fetching Callbacks Count");
    }
    const responseArray =
    {
      businesscount: result[0]["businessCount"] || 0,
      personalcount: result[0]["personalCount"] || 0,
      homeLoancount: result[0]["homeLoanCount"] || 0,
      LAPLoancount: result[0]["lapLoanCount"] || 0,
    }
    res.status(200).json(responseArray);
  });
});
const getStatusCallbacksCountArray = asyncHandler(async (req, res) => {
  let sql = `
      SELECT 
          SUM(CASE WHEN loanType = 'homeLoan' AND employmentStatus = 'employed' THEN 1 ELSE 0 END) AS homeLoanCount,
          SUM(CASE WHEN loanType = 'homeLoan' AND employmentStatus = 'self-employed'  THEN 1 ELSE 0 END) AS homeLoanSelfCount,
          SUM(CASE WHEN loanType = 'lap' AND employmentStatus = 'employed' THEN 1 ELSE 0 END) AS lapLoanCount,
          SUM(CASE WHEN loanType = 'lap' AND employmentStatus = 'self-employed' THEN 1 ELSE 0 END) AS lapLoanSelfCount
      FROM callbacks
  `;
  const queryParams = req.query;
  const filtersQuery = handleGlobalFilters(queryParams, true);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getStatusLeadsCountArray error in controller", err);
      return res.status(500).send("Error in fetching Callbacks Employment Status Count");
    }
    const responseArray =
    {
      homeLoancount: result[0]["homeLoanCount"] || 0,
      homeLoanSelfcount: result[0]["homeLoanSelfCount"] || 0,
      LAPLoancount: result[0]["lapLoanCount"] || 0,
      LAPLoanSelfcount: result[0]["lapLoanSelfCount"] || 0,
    }
    res.status(200).json(responseArray);
  });
});
module.exports = {
  getCallBacks,
  getCallBacksCount,
  getCallBackById,
  createCallBack,
  updateCallBack,
  deleteCallBack,
  changeCallbackStatus,
  getTotalCallbacksCountArray,
  getStatusCallbacksCountArray
};
