const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const {
  createClauseHandler,
  updateClauseHandler
} = require("../middleware/clauseHandler");

const createLogin = asyncHandler((req, res) => {
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
      AND bankId IN (${bankIds.map(() => "?").join(", ")})
  `;
  dbConnect.query(checkExistingQuery, [leadId, ...bankIds], (err, results) => {
    if (err) {
      console.error("Error checking existing logins:", err);
      return res.status(500).send("Error checking existing data");
    }
    if (results.length > 0) {
      const existingBanks = results.map(row => row.bankName);
      return res
        .status(400)
        .send(
          `${existingBanks.join(
            ", "
          )} already exists for lead ID - ${leadId} , Business Name - ${businessName}`
        );
    }
    const insertQueries = bankIds.map((bankId, index) => {
      const bankName = bankNames[index];
      req.body["createdBy"] = req.user.name;
      req.body["lastUpdatedBy"] = req.user.name;
      const rowData = { ...req.body, bankId, bankName };
      const createClause = createClauseHandler(rowData);
      const query = `INSERT INTO logins (${createClause[0]}) VALUES (${createClause[1]})`;
      return query;
    });
    let completedQueries = 0;
    insertQueries.forEach(query => {
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
    const inClause = distinctLeadIds.map(id => `${id}`).join(",");
    let sql = `SELECT * FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching leads:", err);
        res.status(500).send("Error In Fetching Leads");
        return;
      }
      result = parseNestedJSON(result);
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error in getDistinctLeads function:", error);
    res.status(500).send("Error in Fetching Distinct Leads");
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
      const leadIds = result.map(row => row.leadId);
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
    const inClause = distinctLeadIds.map(id => `${id}`).join(",");
    let countSql = `SELECT COUNT(*) AS count FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    const filtersQuery = handleGlobalFilters(queryParams, true);
    countSql += filtersQuery;
    dbConnect.query(countSql, (err, countResult) => {
      if (err) {
        console.error("Error counting leads:", err);
        res.status(500).send("Error in Fetching the Distinct Lead Counts");
        return;
      }
      const count = countResult[0].count;
      res.status(200).send(String(count));
    });
  } catch (error) {
    console.error("Error in countDistinctLeads function:", error);
    res.status(500).send("Error in Fetching Distinct Leads");
  }
});

const getApprovedLeadCount = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctApprovedLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json({ count: 0 });
    }
    const inClause = distinctLeadIds.map(id => `${id}`).join(",");
    let countSql = `SELECT COUNT(*) AS count FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    const filtersQuery = handleGlobalFilters(queryParams, true);
    countSql += filtersQuery;
    dbConnect.query(countSql, (err, countResult) => {
      if (err) {
        console.error("Error counting approved leads:", err);
        res.status(500).send("Error in Fetching the Approved Lead Counts");
        return;
      }
      const count = countResult[0].count;
      res.status(200).send(String(count));
    });
  } catch (error) {
    console.error("Error in countApprovedLeads function:", error);
    res.status(500).send("Error in Fetching Approval Leads");
  }
});
const getDisbursalLeadCount = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctDisbursedLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json({ count: 0 });
    }
    const inClause = distinctLeadIds.map(id => `${id}`).join(",");
    let countSql = `SELECT COUNT(*) AS count FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    const filtersQuery = handleGlobalFilters(queryParams, true);
    countSql += filtersQuery;
    dbConnect.query(countSql, (err, countResult) => {
      if (err) {
        console.error("Error counting disbursal leads:", err);
        res.status(500).send("Error in Fetching the Disbursal Lead Counts");
        return;
      }
      const count = countResult[0].count;
      res.status(200).send(String(count));
    });
  } catch (error) {
    console.error("Error in countDisbursalLeads function:", error);
    res.status(500).send("Error in Fetching Disbursal Leads");
  }
});
const getFIPDetailsById = asyncHandler((req, res) => {
  const sql = `SELECT id, program, bankName, loginDate, fipStatus, fipRemarks FROM logins WHERE leadId = ${req
    .params.leadId}`;
  const queryParams = [req.params.leadId];
  dbConnect.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("getLoginDetailsById error in controller:", err);
      return res.status(500).send("Error in Fetching Details");
    }
    result = result.map(parseNestedJSON);
    res.status(200).json(result);
  });
});

const getApprovalsDetailsById = asyncHandler((req, res) => {
  const leadId = req.params.leadId;
  const sql = `
    SELECT id, program, bankName, lan, sanctionedAmount, disbursedAmount, roi, tenure, processCode, productType, productTypeName, approvalDate, disbursalDate, approvedStatus, approvedRemarks
    FROM logins
    WHERE leadId = ? AND fipStatus = 'approved'
  `;
  const queryParams = [leadId];
  dbConnect.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("getApprovalsDetailsById error in controller:", err);
      return res.status(500).send("Error in Fetching Approval Details");
    }
    result = result.map(parseNestedJSON);
    res.status(200).json(result);
  });
});
const getDisbursalsDetailsById = asyncHandler((req, res) => {
  const leadId = req.params.leadId;
  // const sql = `
  // SELECT id, businessName, approvalDate, disbursalDate, lan, program, bankName, bankId, processCode, productType,productTypeName, sanctionedAmount, disbursedAmount, sanctionedLetter, repaymentSchedule, payoutValue, revenueValue
  //   FROM logins
  //   WHERE leadId = ? AND approvedStatus = 'disbursed' AND fipStatus='approved'
  // `;
  const sql = `
  SELECT *
    FROM logins
    WHERE leadId = ? AND approvedStatus = 'disbursed' AND fipStatus='approved'
  `;
  const queryParams = [leadId];
  dbConnect.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("getDisbursalsDetailsById error in controller:", err);
      return res.status(500).send("Error in Fetching Disbursal Details");
    }
    result = result.map(parseNestedJSON);
    res.status(200).json(result);
  });
});

const updateFIPDetails = asyncHandler((req, res) => {
  req.body = req.body.map(obj => ({
    ...obj,
    lastUpdatedBy: req.user.name
  }));
  const updates = req.body;
  const { leadId } = req.params;
  let sql = `UPDATE logins SET `;
  let params = [];
  updates.forEach((update, index) => {
    const { id, fipStatus, loginDate, fipRemarks, lastUpdatedBy } = update;
    sql += `
      fipStatus = CASE WHEN id = ? THEN ? ELSE fipStatus END,
      loginDate = CASE WHEN id = ? THEN ? ELSE loginDate END,
      fipRemarks = CASE WHEN id = ? THEN ? ELSE fipRemarks END,
      lastUpdatedBy = CASE WHEN id = ? THEN ? ELSE lastUpdatedBy END
      `;
    params.push(
      id,
      fipStatus,
      id,
      loginDate,
      id,
      fipRemarks,
      id,
      lastUpdatedBy
    );
    if (index !== updates.length - 1) {
      sql += ", ";
    }
  });
  sql += ` WHERE id IN (${updates.map(update => "?").join(", ")})`;
  params.push(...updates.map(update => update.id));

  dbConnect.query(sql, params, (err, result) => {
    if (err) {
      console.error("updateApprovalsDetails error in query:", err);
      return res.status(500).send("Error in updating File in Process details");
    }
    const leadSumSql = `
      UPDATE leads
      SET 
          loginDate = (
          SELECT MAX(loginDate)
          FROM logins
          WHERE leadId = ?
        ) 
      WHERE id = ?
    `;
    dbConnect.query(leadSumSql, [leadId, leadId], (sumErr, sumResult) => {
      if (sumErr) {
        console.error(
          "Error updating sanctionedAmount and disbursedAmount in leads table:",
          sumErr
        );
        return res.status(500).send("Error in updating loginDate in leads");
      }
      res.status(200).json({ message: "FIP details updated successfully" });
    });
  });
});

const updateRevenueDetails = asyncHandler((req, res) => {
  req.body = req.body.map(obj => ({
    ...obj,
    lastUpdatedBy: req.user.name
  }));
  const updates = req.body;
  let sql = `UPDATE logins SET `;
  let params = [];
  updates.forEach((update, index) => {
    const { id, payoutValue, revenueValue, lastUpdatedBy } = update;
    sql += `
      payoutValue = CASE WHEN id = ? THEN ? ELSE payoutValue END,
      revenueValue = CASE WHEN id = ? THEN ? ELSE revenueValue END,
      lastUpdatedBy = CASE WHEN id = ? THEN ? ELSE lastUpdatedBy END
      `;
    params.push(id, payoutValue, id, revenueValue, id, lastUpdatedBy);
    if (index !== updates.length - 1) {
      sql += ", ";
    }
  });
  sql += ` WHERE id IN (${updates.map(update => "?").join(", ")})`;
  params.push(...updates.map(update => update.id));
  dbConnect.query(sql, params, (err, result) => {
    if (err) {
      console.error("updateRevenueDetails error in query:", err);
      return res.status(500).send("Error in updating Revenue details");
    }
    res.status(200).json({ message: "Revenue details updated successfully" });
  });
});

const updateApprovalsDetails = asyncHandler((req, res) => {
  req.body = req.body.map(obj => ({
    ...obj,
    lastUpdatedBy: req.user.name
  }));
  const updates = req.body;
  const { leadId } = req.params;
  const fields = [
    "program",
    "bankName",
    "lan",
    "sanctionedAmount",
    "disbursedAmount",
    "roi",
    "tenure",
    "processCode",
    "productType",
    "productTypeName",
    "approvalDate",
    "disbursalDate",
    "approvedStatus",
    "approvedRemarks",
    "lastUpdatedBy"
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
  params.push(...updates.map(update => update.id));
  dbConnect.query(sql, params, (err, result) => {
    if (err) {
      console.error("updateApprovalsDetails error in query:", err);
      return res.status(500).send("Error in updating Approval details");
    }
    const leadSumSql = `
      UPDATE leads
      SET 
        sanctionedAmount = (
          SELECT SUM(sanctionedAmount)
          FROM logins
          WHERE fipStatus = 'approved' AND leadId = ?
        ),
        disbursedAmount = (
          SELECT SUM(disbursedAmount)
          FROM logins
          WHERE fipStatus = 'approved' AND approvedStatus = 'disbursed' AND leadId = ?
        ),
          approvalDate = (
          SELECT MAX(approvalDate)
          FROM logins
          WHERE fipStatus = 'approved' AND leadId = ?
        ),
          disbursalDate = (
          SELECT MAX(disbursalDate)
          FROM logins
          WHERE fipStatus = 'approved' AND approvedStatus = 'disbursed' AND leadId = ?
        )
      WHERE id = ?
    `;
    dbConnect.query(
      leadSumSql,
      [leadId, leadId, leadId, leadId, leadId],
      (sumErr, sumResult) => {
        if (sumErr) {
          console.error(
            "Error updating sanctionedAmount and disbursedAmount in leads table:",
            sumErr
          );
          return res
            .status(500)
            .send("Error in updating details in Lead table");
        }
        res
          .status(200)
          .json({
            message: "Approval details and leads table updated successfully"
          });
      }
    );
  });
});

const getApprovalsLeads = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctApprovedLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json([]);
    }
    const inClause = distinctLeadIds.map(id => `${id}`).join(",");
    let sql = `SELECT * FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching approval details:", err);
        return res.status(500).send("Error in Fetching Approvals");
      }
      result = parseNestedJSON(result);
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error in getApprovalDetails function:", error);
    res.status(500).send("Error in Fetching Approval Leads");
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
      const leadIds = result.map(row => row.leadId);
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
    const inClause = distinctLeadIds.map(id => `${id}`).join(",");
    let sql = `SELECT * FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, queryParams, (err, result) => {
      if (err) {
        console.error("Error fetching disbursal details:", err);
        return res.status(500).send("Error in Fetching Disbursal Leads");
      }
      result = parseNestedJSON(result);
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error in getDisbursalLeads function:", error);
    res.status(500).send("Error in Fetching Disbursal Leads");
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
      const leadIds = result.map(row => row.leadId);
      resolve(leadIds);
    });
  });
}
const updateDisbursalDetails = asyncHandler((req, res) => {
  req.body = req.body.map(obj => ({
    ...obj,
    lastUpdatedBy: req.user.name
  }));
  const updates = req.body;
  let sql = `UPDATE logins SET `;
  let params = [];
  updates.forEach((update, index) => {
    const { id, sanctionedLetter, repaymentSchedule, lastUpdatedBy } = update;
    sql += `
      sanctionedLetter = CASE WHEN id = ? THEN ? ELSE sanctionedLetter END,
      repaymentSchedule = CASE WHEN id = ? THEN ? ELSE repaymentSchedule END,
      lastUpdatedBy = CASE WHEN id = ? THEN ? ELSE lastUpdatedBy END`;
    params.push(
      id,
      JSON.stringify(sanctionedLetter),
      id,
      JSON.stringify(repaymentSchedule),
      id,
      lastUpdatedBy
    );
    if (index !== updates.length - 1) {
      sql += ", ";
    }
  });
  sql += ` WHERE id IN (${updates.map(update => "?").join(", ")})`;
  params.push(...updates.map(update => update.id));
  dbConnect.query(sql, params, (err, result) => {
    if (err) {
      console.error("updateDisbursalDetails error in query:", err);
      return res.status(500).send("Error in updating Disbursal Details");
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
    const inClause = distinctLeadIds.map(id => `${id}`).join(",");
    let sql = `SELECT * FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, queryParams, (err, result) => {
      if (err) {
        console.error("Error fetching approval details:", err);
        return res.status(500).send("Error in Fetching Bank Rejected Leads");
      }
      result = parseNestedJSON(result);
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error in getApprovalDetails function:", error);
    res.status(500).send("Error in Fetching Leads");
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
      const leadIds = result.map(row => row.leadId);
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
    const inClause = distinctLeadIds.map(id => `${id}`).join(",");
    let countSql = `SELECT COUNT(*) AS count FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    const filtersQuery = handleGlobalFilters(queryParams, true);
    countSql += filtersQuery;
    dbConnect.query(countSql, (err, countResult) => {
      if (err) {
        console.error("Error counting bank-rejected leads:", err);
        return res
          .status(500)
          .send("Error in Fetching Bank Rejected Leads Count");
      }
      const count = countResult[0].count;
      res.status(200).send(String(count));
    });
  } catch (error) {
    console.error("Error in countBankRejectedLeads function:", error);
    return res.status(500).send("Error in Fetching Leads");
  }
});
const getCNIRejectsLeads = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctCNIRejectedLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json([]);
    }
    const inClause = distinctLeadIds.map(id => `${id}`).join(",");
    let sql = `SELECT * FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, queryParams, (err, result) => {
      if (err) {
        console.error("Error fetching cni rejected details:", err);
        return res.status(500).send("Error in Fetching CNI Rejected Leads");
      }
      result = parseNestedJSON(result);
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error in getCNIRejectsLeads function:", error);
    return res.status(500).send("Error in Fetching Leads ");
  }
});

async function fetchDistinctCNIRejectedLeadIds() {
  // const sql = `
  //   SELECT DISTINCT leadId
  //   FROM logins
  //   WHERE (fipStatus = 'approved' AND approvedStatus = 'cnis') OR fipStatus ='hold'
  // `;
  const sql = `SELECT DISTINCT leadId 
FROM logins
WHERE (fipStatus = 'approved' AND approvedStatus IN ('cnis', 'hold')) 
   OR fipStatus = 'hold'`;
  return new Promise((resolve, reject) => {
    dbConnect.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const leadIds = result.map(row => row.leadId);
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
    const inClause = distinctLeadIds.map(id => `${id}`).join(",");
    let countSql = `SELECT COUNT(*) AS count FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    const filtersQuery = handleGlobalFilters(queryParams, true);
    countSql += filtersQuery;
    dbConnect.query(countSql, (err, countResult) => {
      if (err) {
        console.error("Error counting CNI-rejected leads:", err);
        return res
          .status(500)
          .send("Error in Fetching CNI Rejected Leads Count");
      }
      const count = countResult[0].count;
      res.status(200).send(String(count));
    });
  } catch (error) {
    console.error("Error in countCNIRejectedLeads function:", error);
    return res.status(500).send("Error in Fetching Leads");
  }
});

const getBankRejectsDetailsById = asyncHandler((req, res) => {
  const leadId = req.params.leadId;
  const sql = `
  SELECT id, program, bankName, loginDate, fipStatus, fipRemarks 
    FROM logins
    WHERE leadId = ? AND fipStatus = 'rejected'
  `;
  const queryParams = [leadId];
  dbConnect.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("getBankRejectsDetailsById error in controller:", err);
      return res.status(500).send("Error in Fetching Bank Rejects Details");
    }
    result = result.map(parseNestedJSON);
    res.status(200).json(result);
  });
});

const getCNIRejectsDetailsById = asyncHandler((req, res) => {
  const leadId = req.params.leadId;
  // const sql = `
  // SELECT id,approvalDate, lan, program, bankName, loginDate, sanctionedAmount, roi, fipStatus, fipRemarks, approvedStatus, approvedRemarks
  //   FROM logins
  //   WHERE leadId = ? AND (approvedStatus = 'cnis' OR fipStatus = 'hold')
  // `;
  const sql = `
  SELECT id,approvalDate, lan, program, bankName, loginDate, sanctionedAmount, roi, fipStatus, fipRemarks, approvedStatus, approvedRemarks
    FROM logins
    WHERE leadId = ? AND (fipStatus = 'hold' OR approvedStatus IN ('cnis', 'hold'))
  `;
  const queryParams = [leadId];
  dbConnect.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("getCNIRejectsDetailsById error in controller:", err);
      return res.status(500).send("Error in Fetching CNI Details");
    }
    result = result.map(parseNestedJSON);
    res.status(200).json(result);
  });
});

const getLoginsDoneById = asyncHandler((req, res) => {
  let sql = `SELECT businessName, program, bankName, fipStatus, fipRemarks FROM logins`;
  const queryParams = req.query;
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getLoginsDoneById Error in controller");
      return res.status(500).send("Error in Fetching Logins Done Details");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result || {});
  });
});

const getLoginsDoneCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as loginsDone FROM logins";
  const queryParams = req.query;
  const filtersQuery = handleGlobalFilters(queryParams, true);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("Error in getUsersCount:", err);
      res.status(500).send("Error in Fetching Logins Done Count");
    } else {
      const loginsDone = result[0]["loginsDone"];
      res.status(200).send(String(loginsDone));
    }
  });
});

const getTotalSanctionedAmountSum = asyncHandler(async (req, res) => {
  let sql = `
    SELECT SUM(sanctionedAmount) AS total_sanctioned_amount
    FROM logins Where fipStatus = 'approved'
   ;
  `;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getTotalSanctionedAmountSum error:", err);
      return res.status(500).send("Error in Fetching Sanctioned Amount ");
    }
    const totalSanctionedAmount = result[0].total_sanctioned_amount;
    res.status(200).json({ totalSanctionedAmount });
  });
});

const getTotalDisbursedAmountSum = asyncHandler(async (req, res) => {
  let sql = `
    SELECT SUM(disbursedAmount) AS total_disbursed_amount
    FROM logins WHERE approvedStatus = 'disbursed' AND fipStatus = 'approved';
  `;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getTotalSanctionedAmountSum error:", err);
      return res.status(500).send("Error in Fetching Disbursed Amount");
    }
    const totalDisbursedAmount = result[0].total_disbursed_amount;
    res.status(200).json({ totalDisbursedAmount });
  });
});

async function fetchFIPProcessDistinctLeadIds() {
  const sql = `
SELECT DISTINCT leadId
FROM logins
WHERE fipStatus NOT IN ('approved', 'rejected', 'hold');
  `;
  return new Promise((resolve, reject) => {
    dbConnect.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const leadIds = result.map(row => row.leadId);
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
    const inClause = distinctLeadIds.map(id => `${id}`).join(",");
    let sql = `SELECT * FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
      if (err) {
        console.error("Error fetching leads:", err);
        res.status(500).send("Error in Fetching Files in Process leads");
        return;
      }
      result = parseNestedJSON(result);
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error in getFIPProcessDistinctLeads function:", error);
    return res.status(500).send("Error in Fetching Leads ");
  }
});
const getFIPProcessDistinctLeadsCount = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchFIPProcessDistinctLeadIds();
    if (distinctLeadIds.length === 0) {
      return res.status(200).json({ count: 0 });
    }
    const inClause = distinctLeadIds.map(id => `${id}`).join(",");
    let sql = `SELECT COUNT(*) as count FROM leads`;
    const queryParams = req.query || {};
    queryParams["id-or"] = inClause;
    const filtersQuery = handleGlobalFilters(queryParams, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
      if (err) {
        console.error("Error counting leads:", err);
        return res.status(500).send("Error in Fetching Files in Process Count");
      }
      res.status(200).send(String(result[0].count));
    });
  } catch (error) {
    console.error("Error in countFIPProcessDistinctLeads function:", error);
    return res.status(500).send("Error in Fetching Leads Count");
  }
});

const deleteLogin = asyncHandler((req, res) => {
  const sql = `DELETE FROM logins WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("deleteLead error:", err);
      return res.status(500).send("Error In Deleting the Login Lead");
    }
    res.status(200).json({ message: "Login Lead Deleted Successfully" });
  });
});
module.exports = {
  createLogin,
  getDistinctLeads,
  getFIPDetailsById,
  getDistinctLeadCount,
  updateFIPDetails,
  updateRevenueDetails,
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
  getLoginsDoneById,
  getTotalSanctionedAmountSum,
  getTotalDisbursedAmountSum,
  getFIPProcessDistinctLeads,
  getFIPProcessDistinctLeadsCount,
  fetchFIPProcessDistinctLeadIds,
  fetchDistinctApprovedLeadIds,
  fetchDistinctDisbursedLeadIds,
  fetchDistinctBankRejectedLeadIds,
  fetchDistinctCNIRejectedLeadIds,
  getLoginsDoneCount,
  deleteLogin
};
