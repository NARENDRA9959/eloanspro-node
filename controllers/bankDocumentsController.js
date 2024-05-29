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

const getBankDocumentsCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as bankDocumentsCount FROM bankdocuments";
  const filtersQuery = handleGlobalFilters(req.query,true);
  //console.log(filtersQuery)
  sql += filtersQuery;
  //console.log(sql);
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getBankDocumentsCount error");
    }
    const bankDocumentsCount = result[0]["bankDocumentsCount"];
    //console.log(bankDocumentsCount)
    res.status(200).send(String(bankDocumentsCount));
  });
});

const getBankDocuments = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM bankdocuments";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getBankDocuments error:");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const getBankDocumentsById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM bankdocuments WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getBankDocumentsById error:");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result[0]);
  });
});

const createBankDocuments = asyncHandler((req, res) => {
  let bankDocumentsId = "D-" + generateRandomNumber(6);
  req.body["bankDocumentsId"] = bankDocumentsId;
  req.body["bankdocumentsInternalStatus"] = 1;
  req.body["lastBankdocumentsInternalStatus"] = 1;
  req.body["createdBy"] = req.user.name;
  const createClause = createClauseHandler(req.body);
  const sql = `INSERT INTO bankdocuments (${createClause[0]}) VALUES (${createClause[1]})`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("createBankDocuments error:");
    }
    res.status(200).send(true);
  });
});

const updateBankDocuments = asyncHandler((req, res) => {
  const id = req.params.id;
  const checkRequiredFields = handleRequiredFields("bankdocuments", req.body);
  if (!checkRequiredFields) {
    res.status(422).send("Please Fill all required fields");
    return;
  }
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE bankdocuments SET ${updateClause} WHERE id = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("updateBankDocuments error:");
    }
    res.status(200).send(result);
  });
});

const changeBankDocumentsStatus = asyncHandler((req, res) => {
  const id = req.params.bankDocumentsId;
  const statusId = req.params.statusId;
  const createSql = `SELECT * FROM bankdocuments WHERE id = ${id}`;
  dbConnect.query(createSql, (err, result) => {
    if (err) {
      console.log("changeBankDocumentsStatus error:");
    }
    if (result && result[0] && statusId) {
      let statusData = {
        lastBankdocumentsInternalStatus: result[0].bankdocumentsInternalStatus,
        bankdocumentsInternalStatus: statusId,
      };
      const updateClause = updateClauseHandler(statusData);
      const sql = `UPDATE bankdocuments SET ${updateClause} WHERE id = ${id}`;
      dbConnect.query(sql, (err, result) => {
        if (err) {
          console.log("changeBankDocumentsStatus and updatecalss error:");
        }
        res.status(200).send(true);
      });
    } else {
      res.status(422).send("No bank documents Found");
    }
  });
});

const deleteBankDocuments = asyncHandler((req, res) => {
  const sql = `DELETE FROM bankdocuments WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("deleteBankDocuments error:");
    }
    res.status(200).send("bank documents Deleted Successfully");
  });
});

module.exports = {
    getBankDocumentsCount,
    getBankDocuments,
    getBankDocumentsById,
    createBankDocuments,
    updateBankDocuments,
    changeBankDocumentsStatus,
    deleteBankDocuments
};
