const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const moment = require('moment');
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const {
  createClauseHandler,
  updateClauseHandler,
} = require("../middleware/clauseHandler");

// const createLogin = asyncHandler((req, res) => {
//   console.log("Request body:", req.body);
//   const bankIds = req.body.bankId;
//   const bankNames = req.body.Banks;
//   delete req.body.bankId;
//   delete req.body.Banks;
//   if (
//     !Array.isArray(bankIds) ||
//     bankIds.length === 0 ||
//     !Array.isArray(bankNames) ||
//     bankNames.length === 0 ||
//     bankIds.length !== bankNames.length
//   ) {
//     return res
//       .status(400)
//       .send(
//         "Bank IDs and names are required and should be non-empty arrays of the same length"
//       );
//   }
//   const insertQueries = bankIds.map((bankId, index) => {
//     const bankName = bankNames[index];
//     const rowData = { ...req.body, bankId, bankName };
//     const createClause = createClauseHandler(rowData);
//     const query = `INSERT INTO logins (${createClause[0]}) VALUES (${createClause[1]})`;
//     return query;
//   });
//   let completedQueries = 0;
//   insertQueries.forEach((query) => {
//     dbConnect.query(query, (err, result) => {
//       if (err) {
//         console.log("createLogin error:", err);
//         res.status(500).send("Error inserting data");
//         return;
//       }
//       completedQueries++;
//       if (completedQueries === insertQueries.length) {
//         res.status(200).send(true);
//       }
//     });
//   });
// });

const createLogin = asyncHandler((req, res) => {
  console.log("Request body:", req.body);
  const leadId = req.body.leadId;
  const businessName = req.body.businessName;
  const bankIds = req.body.bankId;
  const bankNames = req.body.Banks;
  delete req.body.bankId;
  delete req.body.Banks;
  if (
    !leadId ||
    !Array.isArray(bankIds) ||
    bankIds.length === 0 ||
    !Array.isArray(bankNames) ||
    bankNames.length === 0 ||
    bankIds.length !== bankNames.length
  ) {
    return res
      .status(400)
      .send(
        "Lead ID, bank IDs, and names are required and should be non-empty arrays of the same length"
      );
  }
  const checkExistingQuery = `
      SELECT bankId, bankName
      FROM logins
      WHERE leadId = ?
      AND bankId IN (${bankIds.map(() => '?').join(', ')})
  `;
  console.log(checkExistingQuery)
  dbConnect.query(checkExistingQuery, [leadId, ...bankIds], (err, results) => {
    if (err) {
      console.error("Error checking existing logins:", err);
      return res.status(500).send("Error checking existing data");
    }
    if (results.length > 0) {
      const existingBanks = results.map((row) => row.bankName);
      return res.status(400).send(`${existingBanks.join(', ')} already exists for lead ID - ${leadId} , Business Name - ${businessName}`);
    }
    const insertQueries = bankIds.map((bankId, index) => {
      const bankName = bankNames[index];
      const rowData = { ...req.body, bankId, bankName };
      const createClause = createClauseHandler(rowData);
      const query = `INSERT INTO logins (${createClause[0]}) VALUES (${createClause[1]})`;
      return query;
    });
    let completedQueries = 0;
    insertQueries.forEach((query) => {
      dbConnect.query(query, (err, result) => {
        if (err) {
          console.error("createLogin error:", err);
          res.status(500).send("Error inserting data");
          return;
        }
        completedQueries++;
        if (completedQueries === insertQueries.length) {
          res.status(200).send(true);
        }
      });
    });
  });
});


const getDistinctLeads = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json([]);
    }
    const inClause = distinctLeadIds.map((id) => `${id}`).join(",");
    let sql = `SELECT * FROM leads`;
    const queryParams = req.query || {};
    //console.log(inClause);
    queryParams["id-or"] = inClause;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    //console.log(sql);
    dbConnect.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching leads:", err);
        res.status(500).json({ error: "Error fetching leads" });
        return;
      }
      result = parseNestedJSON(result);
      console.log(result);
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error in getDistinctLeads function:", error);
    res.status(500).json({ error: "Error in getDistinctLeads function" });
  }
});
async function fetchDistinctLeadIds() {
  const sql = "SELECT DISTINCT leadId FROM logins";
  return new Promise((resolve, reject) => {
    dbConnect.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const leadIds = result.map((row) => row.leadId);
      resolve(leadIds);
    });
  });
}
const getDistinctLeadCount = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json({ count: 0 });
    }
    const inClause = distinctLeadIds.map((id) => `${id}`).join(",");
    let countSql = `SELECT COUNT(*) AS count FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    const filtersQuery = handleGlobalFilters(queryParams, true);
    countSql += filtersQuery;
    dbConnect.query(countSql, (err, countResult) => {
      if (err) {
        console.error("Error counting leads:", err);
        res.status(500).json({ error: "Error counting leads" });
        return;
      }
      const count = countResult[0].count;
      res.status(200).send(String(count));
    });
  } catch (error) {
    console.error("Error in countDistinctLeads function:", error);
    res.status(500).json({ error: "Error in countDistinctLeads function" });
  }
});

const getApprovedLeadCount = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctApprovedLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json({ count: 0 });
    }
    const inClause = distinctLeadIds.map((id) => `${id}`).join(",");
    let countSql = `SELECT COUNT(*) AS count FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    const filtersQuery = handleGlobalFilters(queryParams, true);
    countSql += filtersQuery;
    dbConnect.query(countSql, (err, countResult) => {
      if (err) {
        console.error("Error counting approved leads:", err);
        res.status(500).json({ error: "Error counting approved leads" });
        return;
      }
      const count = countResult[0].count;
      res.status(200).send(String(count));
    });
  } catch (error) {
    console.error("Error in countApprovedLeads function:", error);
    res.status(500).json({ error: "Error in countApprovedLeads function" });
  }
});
const getDisbursalLeadCount = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctDisbursedLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json({ count: 0 });
    }
    const inClause = distinctLeadIds.map((id) => `${id}`).join(",");
    let countSql = `SELECT COUNT(*) AS count FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    const filtersQuery = handleGlobalFilters(queryParams, true);
    countSql += filtersQuery;
    dbConnect.query(countSql, (err, countResult) => {
      if (err) {
        console.error("Error counting disbursal leads:", err);
        res.status(500).json({ error: "Error counting disbursal leads" });
        return;
      }
      const count = countResult[0].count;
      res.status(200).send(String(count));
    });
  } catch (error) {
    console.error("Error in countDisbursalLeads function:", error);
    res.status(500).json({ error: "Error in countDisbursalLeads function" });
  }
});
const getFIPDetailsById = asyncHandler((req, res) => {
  const sql = `SELECT id, program, bankName, fipStatus, fipRemarks FROM logins WHERE leadId = ${req.params.leadId}`;
  const queryParams = [req.params.leadId];
  dbConnect.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("getLoginDetailsById error in controller:", err);
      return res.status(500).json({ error: "Error fetching login details" });
    }
    result = result.map(parseNestedJSON);
    res.status(200).json(result);
  });
});
const getApprovalsDetailsById = asyncHandler((req, res) => {
  const leadId = req.params.leadId;
  const sql = `
    SELECT id, program, bankName, lan, sanctionedAmount, disbursedAmount, roi, tenure, processCode, approvalDate, disbursalDate, approvedStatus, approvedRemarks
    FROM logins
    WHERE leadId = ? AND fipStatus = 'approved'
  `;
  const queryParams = [leadId];
  dbConnect.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("getApprovalsDetailsById error in controller:", err);
      return res.status(500).json({ error: "Error fetching login details" });
    }
    result = result.map(parseNestedJSON);
    res.status(200).json(result);
  });
});
const getDisbursalsDetailsById = asyncHandler((req, res) => {
  const leadId = req.params.leadId;
  const sql = `
  SELECT id, businessName, approvalDate, disbursalDate, lan, program, bankName, bankId, processCode, sanctionedAmount, disbursedAmount, sanctionedLetter, repaymentSchedule 
    FROM logins
    WHERE leadId = ? AND approvedStatus = 'disbursed' AND fipStatus='approved'
  `;
  const queryParams = [leadId];
  dbConnect.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("getDisbursalsDetailsById error in controller:", err);
      return res.status(500).json({ error: "Error fetching login details" });
    }
    result = result.map(parseNestedJSON);
    res.status(200).json(result);
  });
});
const updateFIPDetails = asyncHandler((req, res) => {
  const updates = req.body;
  let sql = `UPDATE logins SET `;
  let params = [];
  updates.forEach((update, index) => {
    const { id, fipStatus, fipRemarks } = update;
    sql += `
      fipStatus = CASE WHEN id = ? THEN ? ELSE fipStatus END,
      fipRemarks = CASE WHEN id = ? THEN ? ELSE fipRemarks END`;
    params.push(id, fipStatus, id, fipRemarks);
    if (index !== updates.length - 1) {
      sql += ", ";
    }
  });
  sql += ` WHERE id IN (${updates.map((update) => "?").join(", ")})`;
  params.push(...updates.map((update) => update.id));
  dbConnect.query(sql, params, (err, result) => {
    if (err) {
      console.error("updateFIPDetails error in query:", err);
      return res.status(500).json({ error: "Error updating FIP details" });
    }
    res.status(200).json({ message: "FIP details updated successfully" });
  });
});

const updateApprovalsDetails = asyncHandler((req, res) => {
  const updates = req.body;
  const fields = [
    "program",
    "bankName",
    "lan",
    "sanctionedAmount",
    "disbursedAmount",
    "roi",
    "tenure",
    "processCode",
    "approvalDate",
    "disbursalDate",
    "approvedStatus",
    "approvedRemarks",
  ];
  let sql = "UPDATE logins SET ";
  const params = [];
  fields.forEach((field, fieldIndex) => {
    sql += `${field} = CASE `;
    updates.forEach((update, updateIndex) => {
      sql += `WHEN id = ? THEN ? `;
      params.push(update.id, update[field]);
    });
    sql += `ELSE ${field} END`;
    if (fieldIndex < fields.length - 1) {
      sql += ", ";
    }
  });
  sql += ` WHERE id IN (${updates.map(() => "?").join(", ")})`;
  params.push(...updates.map((update) => update.id));
  dbConnect.query(sql, params, (err, result) => {
    if (err) {
      console.error("updateApprovalsDetails error in query:", err);
      return res.status(500).json({ error: "Error updating approval details" });
    }
    res.status(200).json({ message: "Approval details updated successfully" });
  });
});

const getApprovalsLeads = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctApprovedLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json([]);
    }
    const inClause = distinctLeadIds.map((id) => `${id}`).join(",");
    let sql = `SELECT * FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching approval details:", err);
        res.status(500).json({ error: "Error fetching approval details" });
        return;
      }
      result = parseNestedJSON(result);
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error in getApprovalDetails function:", error);
    res.status(500).json({ error: "Error in getApprovalDetails function" });
  }
});
async function fetchDistinctApprovedLeadIds() {
  const sql = `
    SELECT DISTINCT leadId
    FROM logins
    WHERE fipStatus = 'approved'
  `;
  return new Promise((resolve, reject) => {
    dbConnect.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const leadIds = result.map((row) => row.leadId);
      resolve(leadIds);
    });
  });
}

const getDisbursalLeads = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctDisbursedLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json([]);
    }
    const inClause = distinctLeadIds.map((id) => `${id}`).join(",");
    let sql = `SELECT * FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, queryParams, (err, result) => {
      if (err) {
        console.error("Error fetching disbursal details:", err);
        res.status(500).json({ error: "Error fetching disbursal details" });
        return;
      }
      result = parseNestedJSON(result);
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error in getDisbursalLeads function:", error);
    res.status(500).json({ error: "Error in getDisbursalLeads function" });
  }
});

async function fetchDistinctDisbursedLeadIds() {
  const sql = `
    SELECT DISTINCT leadId
    FROM logins
    WHERE approvedStatus = 'disbursed' AND fipStatus = 'approved'
  `;
  return new Promise((resolve, reject) => {
    dbConnect.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const leadIds = result.map((row) => row.leadId);
      resolve(leadIds);
    });
  });
}
const updateDisbursalDetails = asyncHandler((req, res) => {
  const updates = req.body;
  let sql = `UPDATE logins SET `;
  let params = [];
  updates.forEach((update, index) => {
    const { id, sanctionedLetter, repaymentSchedule } = update;
    sql += `
      sanctionedLetter = CASE WHEN id = ? THEN ? ELSE sanctionedLetter END,
      repaymentSchedule = CASE WHEN id = ? THEN ? ELSE repaymentSchedule END`;
    params.push(
      id,
      JSON.stringify(sanctionedLetter),
      id,
      JSON.stringify(repaymentSchedule)
    );
    if (index !== updates.length - 1) {
      sql += ", ";
    }
  });
  sql += ` WHERE id IN (${updates.map((update) => "?").join(", ")})`;
  params.push(...updates.map((update) => update.id));
  dbConnect.query(sql, params, (err, result) => {
    if (err) {
      console.error("updateDisbursalDetails error in query:", err);
      return res
        .status(500)
        .json({ error: "Error updating disbursal details" });
    }
    res.status(200).json({ message: "Disbursal details updated successfully" });
  });
});
//rejects
const getBankRejectsLeads = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctBankRejectedLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json([]);
    }
    const inClause = distinctLeadIds.map((id) => `${id}`).join(",");
    let sql = `SELECT * FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, queryParams, (err, result) => {
      if (err) {
        console.error("Error fetching approval details:", err);
        res.status(500).json({ error: "Error fetching approval details" });
        return;
      }
      result = parseNestedJSON(result);
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error in getApprovalDetails function:", error);
    res.status(500).json({ error: "Error in getApprovalDetails function" });
  }
});

async function fetchDistinctBankRejectedLeadIds() {
  const sql = `
    SELECT DISTINCT leadId
    FROM logins
    WHERE fipStatus = 'rejected'
  `;
  return new Promise((resolve, reject) => {
    dbConnect.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const leadIds = result.map((row) => row.leadId);
      resolve(leadIds);
    });
  });
}

const getBankRejectedLeadCount = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctBankRejectedLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json({ count: 0 });
    }
    const inClause = distinctLeadIds.map((id) => `${id}`).join(",");
    let countSql = `SELECT COUNT(*) AS count FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    const filtersQuery = handleGlobalFilters(queryParams, true);
    countSql += filtersQuery;
    dbConnect.query(countSql, (err, countResult) => {
      if (err) {
        console.error("Error counting bank-rejected leads:", err);
        res.status(500).json({ error: "Error counting bank-rejected leads" });
        return;
      }
      const count = countResult[0].count;
      res.status(200).send(String(count));
    });
  } catch (error) {
    console.error("Error in countBankRejectedLeads function:", error);
    res.status(500).json({ error: "Error in countBankRejectedLeads function" });
  }
});
const getCNIRejectsLeads = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctCNIRejectedLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json([]);
    }
    const inClause = distinctLeadIds.map((id) => `${id}`).join(",");
    let sql = `SELECT * FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, queryParams, (err, result) => {
      if (err) {
        console.error("Error fetching cni rejected details:", err);
        res.status(500).json({ error: "Error  getCNIRejectsLeads details" });
        return;
      }
      result = parseNestedJSON(result);
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error in getCNIRejectsLeads function:", error);
    res.status(500).json({ error: "Error in getCNIRejectsLeads function" });
  }
});

async function fetchDistinctCNIRejectedLeadIds() {
  const sql = `
    SELECT DISTINCT leadId
    FROM logins
    WHERE approvedStatus = 'cnis'
  `;
  return new Promise((resolve, reject) => {
    dbConnect.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const leadIds = result.map((row) => row.leadId);
      resolve(leadIds);
    });
  });
}

const getCNIRejectedLeadCount = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctCNIRejectedLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json({ count: 0 });
    }
    const inClause = distinctLeadIds.map((id) => `${id}`).join(",");
    let countSql = `SELECT COUNT(*) AS count FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    const filtersQuery = handleGlobalFilters(queryParams, true);
    countSql += filtersQuery;
    dbConnect.query(countSql, (err, countResult) => {
      if (err) {
        console.error("Error counting CNI-rejected leads:", err);
        res.status(500).json({ error: "Error counting CNI-rejected leads" });
        return;
      }
      const count = countResult[0].count;
      res.status(200).send(String(count));
    });
  } catch (error) {
    console.error("Error in countCNIRejectedLeads function:", error);
    res.status(500).json({ error: "Error in countCNIRejectedLeads function" });
  }
});

// const getCNIRejectedLeadCount = asyncHandler(async (req, res) => {
//   try {
//     const cniLeadCount = await fetchCNIRejectedLeadCount();
//     res.status(200).send(String(cniLeadCount));
//   } catch (error) {
//     console.error("Error in getCNIRejectedLeadCount function:", error);
//     res
//       .status(500)
//       .json({ error: "Error in getCNIRejectedLeadCount function" });
//   }
// });

// async function fetchCNIRejectedLeadCount() {
//   const sql =
//     "SELECT COUNT(DISTINCT leadId) AS leadCount FROM logins  WHERE approvedStatus = 'cnis'";
//   return new Promise((resolve, reject) => {
//     dbConnect.query(sql, (err, result) => {
//       if (err) {
//         reject(err);
//         return;
//       }
//       const leadCount = result[0].leadCount;
//       resolve(leadCount);
//     });
//   });
// }

const getBankRejectsDetailsById = asyncHandler((req, res) => {
  const leadId = req.params.leadId;
  const sql = `
  SELECT id, program, bankName, fipStatus, fipRemarks 
    FROM logins
    WHERE leadId = ? AND fipStatus = 'rejected'
  `;
  const queryParams = [leadId];
  dbConnect.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("getBankRejectsDetailsById error in controller:", err);
      return res
        .status(500)
        .json({ error: "Error fetching getBankRejectsDetailsById details" });
    }
    result = result.map(parseNestedJSON);
    res.status(200).json(result);
  });
});

const getCNIRejectsDetailsById = asyncHandler((req, res) => {
  const leadId = req.params.leadId;
  const sql = `
  SELECT id,approvalDate, lan, program, bankName,sanctionedAmount, roi, approvedStatus, approvedRemarks
    FROM logins
    WHERE leadId = ? AND approvedStatus = 'cnis'
  `;
  const queryParams = [leadId];
  dbConnect.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("getCNIRejectsDetailsById error in controller:", err);
      return res
        .status(500)
        .json({ error: "Error fetching getCNIRejectsDetailsById details" });
    }
    result = result.map(parseNestedJSON);
    res.status(200).json(result);
  });
});

const getSanctionedAmountSum = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  let sql = `
    SELECT SUM(sanctionedAmount) AS total_sanctioned_amount
    FROM logins
  `;
  const queryParams = req.query || {};
  queryParams["leadId-eq"] = leadId;
  queryParams["fipStatus-eq"] = 'approved';
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  console.log(sql)
  dbConnect.query(sql, [leadId], (err, result) => {
    if (err) {
      console.log("getSanctionedAmountSum error:", err);
      return res.status(500).send("Error retrieving sanctioned amount sum");
    }
    const totalSanctionedAmount = result[0].total_sanctioned_amount;
    res.status(200).json({ totalSanctionedAmount });
  });
});


const getDisbursedAmountSum = asyncHandler(async (req, res) => {
  const { leadId } = req.params;
  let sql = `
    SELECT SUM(disbursedAmount) AS total_disbursed_amount
    FROM logins
  `;
  const queryParams = req.query || {};
  queryParams["leadId-eq"] = leadId;
  queryParams["fipStatus-eq"] = 'approved';
  queryParams["approvedStatus-eq"] = 'disbursed';
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  console.log(sql)
  dbConnect.query(sql, [leadId], (err, result) => {
    if (err) {
      console.log("getDisbursedAmountSum error:", err);
      return res.status(500).send("Error retrieving sanctioned amount sum");
    }
    const totalDisbursedAmount = result[0].total_disbursed_amount;
    res.status(200).json({ totalDisbursedAmount });
  });
});


const getLoginsDoneById = asyncHandler((req, res) => {
  const sql = `SELECT businessName, program, bankName, fipStatus, fipRemarks FROM logins WHERE bankId = ${req.params.leadId}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getLoginsDoneById Error in controller");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result || {});
  });
});

// const getTotalSanctionedAmountSum = asyncHandler(async (req, res) => {
//   let sql = `
//  SELECT SUM(lg.sanctionedAmount) AS totalSanctionedAmount
// FROM logins lg
// WHERE lg.fipstatus = 'approved'
//   AND lg.leadId IN (
//     SELECT id
//     FROM leads
//     WHERE YEAR(createdOn) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
//       AND MONTH(createdOn) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
//   );

//   `;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("getTotalSanctionedAmountSum error:", err);
//       return res.status(500).send("Error retrieving sanctioned amount sum");
//     }

//     const totalSanctionedAmount = result[0].totalSanctionedAmount;
//     console.log(totalSanctionedAmount);
//     res.status(200).json({ totalSanctionedAmount });
//   });
// });

// async function fetchLeadIdsForLastMonth() {
//   const sql = `
//     SELECT id
//     FROM leads
//     WHERE YEAR(createdOn) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
//       AND MONTH(createdOn) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
//   `;
//   return new Promise((resolve, reject) => {
//     dbConnect.query(sql, (err, result) => {
//       if (err) {
//         reject(err);
//         return;
//       }
//       const leadIds = result.map((row) => row.id);
//       resolve(leadIds);
//     });
//   });
// }
// const getTotalSanctionedAmountSum = asyncHandler(async (req, res) => {
//   try {
//     const leadIds = await fetchLeadIdsForLastMonth();
//     if (leadIds.length === 0) {
//       return res.status(200).json({ totalSanctionedAmount: 0 });
//     }
//     const inClause = leadIds.map((id) => `${id}`).join(",");
//     let sql = `
//       SELECT SUM(lg.sanctionedAmount) AS totalSanctionedAmount
//       FROM logins lg
//       WHERE lg.fipstatus = 'approved'
//         AND lg.leadId IN (${inClause});
//     `;
//     dbConnect.query(sql, (err, result) => {
//       if (err) {
//         console.error("Error fetching sanctioned amount sum:", err);
//         return res
//           .status(500)
//           .json({ error: "Error retrieving sanctioned amount sum" });
//       }
//       const totalSanctionedAmount = result[0].totalSanctionedAmount || 0;
//       console.log("Total sanctioned amount:", totalSanctionedAmount);
//       res.status(200).json({ totalSanctionedAmount });
//     });
//   } catch (error) {
//     console.error("Error in getTotalSanctionedAmountSum function:", error);
//     res
//       .status(500)
//       .json({ error: "Error in getTotalSanctionedAmountSum function" });
//   }
// });
// const getTotalDisbursedAmountSum = asyncHandler(async (req, res) => {
//   try {
//     const leadIds = await fetchLeadIdsForLastMonth();
//     if (leadIds.length === 0) {
//       return res.status(200).json({ totalDisbursedAmount: 0 });
//     }
//     const inClause = leadIds.map((id) => `${id}`).join(",");
//     let sql = `
//       SELECT SUM(lg.disbursedAmount) AS totalDisbursedAmount
//       FROM logins lg
//       WHERE lg.fipstatus = 'approved' 
//       AND lg.approvedStatus='disbursed'
//         AND lg.leadId IN (${inClause});
//     `;
//     dbConnect.query(sql, (err, result) => {
//       if (err) {
//         console.error("Error fetching disbursed amount sum:", err);
//         return res
//           .status(500)
//           .json({ error: "Error retrieving disbursed amount sum" });
//       }
//       const totalDisbursedAmount = result[0].totalDisbursedAmount || 0;
//       console.log("Total disbursed amount:", totalDisbursedAmount);
//       res.status(200).json({ totalDisbursedAmount });
//     });
//   } catch (error) {
//     console.error("Error in getTotalDisbursedAmountSum function:", error);
//     res
//       .status(500)
//       .json({ error: "Error in getTotalDisbursedAmountSum function" });
//   }
// });
//============================
const getTotalSanctionedAmountSum = asyncHandler(async (req, res) => {
  let sql = `
    SELECT SUM(sanctionedAmount) AS total_sanctioned_amount
    FROM logins Where fipStatus = 'approved'
   ;
  `;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getTotalSanctionedAmountSum error:", err);
      return res.status(500).send("Error retrieving sanctioned amount sum");
    }

    const totalSanctionedAmount = result[0].total_sanctioned_amount;
    res.status(200).json({ totalSanctionedAmount });
  });
});

//=============


// const getTotalSanctionedAmountSum = asyncHandler(async (req, res) => {
//   const currentDate = new Date();
//   const lastMonthStartDate = moment(new Date(
//     currentDate.getFullYear(),
//     currentDate.getMonth() - 1,
//     1
//   )).format('YYYY-MM-DD');
//   const lastMonthEndDate = moment(new Date(
//     currentDate.getFullYear(),
//     currentDate.getMonth(),
//     0
//   )).format('YYYY-MM-DD');

//   console.log(lastMonthStartDate)
//   console.log(lastMonthEndDate)
//   let sql = `
//  SELECT SUM(lg.sanctionedAmount) AS totalSanctionedAmount
// FROM logins lg
// WHERE lg.fipstatus = 'approved'
//   AND lg.leadId IN (
//     SELECT id
//     FROM leads
//     WHERE createdOn >= ? AND createdOn <= ?
//   );

//   `;
//   console.log(sql)
//   dbConnect.query(sql, [lastMonthStartDate, lastMonthEndDate], (err, result) => {
//     if (err) {
//       console.log("getTotalSanctionedAmountSum error:", err);
//       return res.status(500).send("Error retrieving sanctioned amount sum");
//     }

//     const totalSanctionedAmount = result[0].totalSanctionedAmount;
//     console.log("totalSanctionedAmount", totalSanctionedAmount);
//     res.status(200).json({ totalSanctionedAmount });
//   });
// });
//===============
const getTotalDisbursedAmountSum = asyncHandler(async (req, res) => {
  let sql = `
    SELECT SUM(disbursedAmount) AS total_disbursed_amount
    FROM logins WHERE approvedStatus = 'disbursed' AND fipStatus = 'approved';
  `;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getTotalSanctionedAmountSum error:", err);
      return res.status(500).send("Error retrieving sanctioned amount sum");
    }

    const totalDisbursedAmount = result[0].total_disbursed_amount;
    res.status(200).json({ totalDisbursedAmount });
  });
});
//============

// const getTotalDisbursedAmountSum = asyncHandler(async (req, res) => {
//   const currentDate = new Date();
//   const lastMonthStartDate1 = moment(new Date(
//     currentDate.getFullYear(),
//     currentDate.getMonth() - 1,
//     1
//   )).format('YYYY-MM-DD');
//   const lastMonthEndDate1 = moment(new Date(
//     currentDate.getFullYear(),
//     currentDate.getMonth(),
//     0
//   )).format('YYYY-MM-DD');

//   console.log(lastMonthStartDate1)
//   console.log(lastMonthEndDate1)

//   let sql = `
//       SELECT SUM(lg.disbursedAmount) AS totalDisbursedAmount
//       FROM logins lg
//       WHERE lg.fipstatus = 'approved' 
//       AND lg.approvedStatus='disbursed'
//         AND lg.leadId IN ( SELECT id
//     FROM leads
//     WHERE createdOn >= ? AND createdOn <= ?);
//     `;
//   console.log(sql)
//   dbConnect.query(sql, [lastMonthStartDate1, lastMonthEndDate1], (err, result) => {
//     if (err) {
//       console.log("totalDisbursedAmount error:", err);
//       return res.status(500).send("Error retrieving totalDisbursedAmount  sum");
//     }
//     const totalDisbursedAmount = result[0].totalDisbursedAmount;
//     console.log("totalDisbursedAmount", totalDisbursedAmount);
//     res.status(200).json({ totalDisbursedAmount });
//   });
// });

async function fetchFIPProcessDistinctLeadIds() {
  const sql = `
    SELECT DISTINCT leadId
    FROM logins
    WHERE fipstatus != 'approved' AND fipstatus != 'rejected'
  `;
  return new Promise((resolve, reject) => {
    dbConnect.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const leadIds = result.map((row) => row.leadId);
      resolve(leadIds);
    });
  });
}

const getFIPProcessDistinctLeads = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchFIPProcessDistinctLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json([]);
    }
    const inClause = distinctLeadIds.map((id) => `${id}`).join(",");
    let sql = `SELECT * FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching leads:", err);
        res.status(500).json({ error: "Error fetching leads" });
        return;
      }
      result = parseNestedJSON(result);
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error in getFIPProcessDistinctLeads function:", error);
    res.status(500).json({ error: "Error in getFIPProcessDistinctLeads function" });
  }
});
const getFIPProcessDistinctLeadsCount = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchFIPProcessDistinctLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json({ count: 0 });
    }
    const inClause = distinctLeadIds.map((id) => `${id}`).join(",");
    let sql = `SELECT COUNT(*) as count FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    const filtersQuery = handleGlobalFilters(queryParams, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
      if (err) {
        console.error("Error counting leads:", err);
        res.status(500).json({ error: "Error counting leads" });
        return;
      }
      res.status(200).send(String(result[0].count));
    });
  } catch (error) {
    console.error("Error in countFIPProcessDistinctLeads function:", error);
    res.status(500).json({ error: "Error in countFIPProcessDistinctLeads function" });
  }
});
module.exports = {
  createLogin,
  getDistinctLeads,
  getFIPDetailsById,
  getDistinctLeadCount,
  updateFIPDetails,
  getApprovalsLeads,
  getApprovalsDetailsById,
  updateApprovalsDetails,
  getApprovedLeadCount,
  getDisbursalLeads,
  getDisbursalLeadCount,
  getDisbursalsDetailsById,
  updateDisbursalDetails,
  getBankRejectsLeads,
  getBankRejectedLeadCount,
  getCNIRejectsLeads,
  getCNIRejectedLeadCount,
  getBankRejectsDetailsById,
  getCNIRejectsDetailsById,
  getSanctionedAmountSum,
  getDisbursedAmountSum,
  getLoginsDoneById,
  getTotalSanctionedAmountSum,
  getTotalDisbursedAmountSum,
  getFIPProcessDistinctLeads,
  getFIPProcessDistinctLeadsCount,
  fetchFIPProcessDistinctLeadIds,
  fetchDistinctApprovedLeadIds,
  fetchDistinctDisbursedLeadIds,
  fetchDistinctBankRejectedLeadIds,
  fetchDistinctCNIRejectedLeadIds
};
