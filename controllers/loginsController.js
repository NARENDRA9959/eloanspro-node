const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");

const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const {
  createClauseHandler,
  updateClauseHandler,
} = require("../middleware/clauseHandler");
const createLogin = asyncHandler((req, res) => {
  console.log("Request body:", req.body);
  req.body["createdBy"] = req.user.name;
  const bankIds = req.body.bankId;
  const bankNames = req.body.Banks;
  delete req.body.bankId;
  delete req.body.Banks;
  if (
    !Array.isArray(bankIds) ||
    bankIds.length === 0 ||
    !Array.isArray(bankNames) ||
    bankNames.length === 0
  ) {
    return res
      .status(400)
      .send("Bank IDs and names are required and should not be empty");
  }
  if (bankIds.length !== bankNames.length) {
    return res.status(400).send("Bank IDs and names array lengths must match");
  }
  const insertQueries = bankIds.map((bankId, index) => {
    const bankName = bankNames[index];
    const rowData = { ...req.body, bankId, bankName };
    const createClause = createClauseHandler(rowData);
    console.log("Row data:", rowData);
    console.log("Create clause:", createClause);
    return `INSERT INTO logins (${createClause[0]}) VALUES (${createClause[1]})`;
  });
  console.log("Insert queries:", insertQueries);
  let queryPromises = insertQueries.map((query) => {
    return new Promise((resolve, reject) => {
      dbConnect.query(query, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  });
  Promise.all(queryPromises)
    .then((results) => {
      res.status(200).send(true);
    })
    .catch((err) => {
      console.log("createLogin error:", err);
      res.status(500).send("Error inserting data");
    });
});
const getDistinctLeads = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctLeadIds();

    if (distinctLeadIds.length === 0) {
      return res.status(200).json([]); // Return an empty array if there are no distinct lead IDs
    }

    let sql = "SELECT * FROM leads WHERE id IN (?)";
    const queryParams = [distinctLeadIds];
    const filtersQuery = handleGlobalFilters(req.query);
    sql += filtersQuery;

    dbConnect.query(sql, queryParams, (err, result) => {
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
    const distinctLeadCount = await fetchDistinctLeadCount();
    res.status(200).send(String(distinctLeadCount));
  } catch (error) {
    console.error("Error in getDistinctLeadCount function:", error);
    res.status(500).json({ error: "Error in getDistinctLeadCount function" });
  }
});

async function fetchDistinctLeadCount() {
  const sql = "SELECT COUNT(DISTINCT leadId) AS leadCount FROM logins";
  return new Promise((resolve, reject) => {
    dbConnect.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const leadCount = result[0].leadCount;
      resolve(leadCount);
    });
  });
}


const getApprovedLeadCount = asyncHandler(async (req, res) => {
  try {
    const approvedLeadCount = await fetchApprovedLeadCount();
    res.status(200).send(String(approvedLeadCount));
  } catch (error) {
    console.error("Error in getApprovedLeadCount function:", error);
    res.status(500).json({ error: "Error in getApprovedLeadCount function" });
  }
});

async function fetchApprovedLeadCount() {
  const sql = "SELECT COUNT(DISTINCT leadId) AS leadCount FROM logins WHERE fipStatus = 'approved'";
  return new Promise((resolve, reject) => {
    dbConnect.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const leadCount = result[0].leadCount;
      resolve(leadCount);
    });
  });
}

const getDisbursalLeadCount = asyncHandler(async (req, res) => {
  try {
    const disbursalLeadCount = await fetchDisbursalLeadCount();
    res.status(200).send(String(disbursalLeadCount));
  } catch (error) {
    console.error("Error in getDisbursalLeadCount function:", error);
    res.status(500).json({ error: "Error in getDisbursalLeadCount function" });
  }
});

async function fetchDisbursalLeadCount() {
  const sql = "SELECT COUNT(DISTINCT leadId) AS leadCount FROM logins WHERE approvedStatus = 'disbursed'";
  return new Promise((resolve, reject) => {
    dbConnect.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const leadCount = result[0].leadCount;
      resolve(leadCount);
    });
  });
}


const getFIPDetailsById = asyncHandler((req, res) => {
  console.log(req);
  const sql = `SELECT id, program, bankName, fipStatus, fipRemarks FROM logins WHERE leadId = ${req.params.leadId}`;
  const queryParams = [req.params.leadId];
  console.log(queryParams);
  dbConnect.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("getLoginDetailsById error in controller:", err);
      return res.status(500).json({ error: "Error fetching login details" });
    }
    result = result.map(parseNestedJSON);
    console.log(result);
    res.status(200).json(result);
  });
});

const getApprovalsDetailsById = asyncHandler((req, res) => {
  const leadId = req.params.leadId;
  const sql = `
    SELECT id, program, bankName, lan, sanctionedAmount, disbursedAmount, roi, tenure, approvalDate, approvedStatus, approvedRemarks
    FROM logins
    WHERE leadId = ? AND fipStatus = 'approved'
  `;
  const queryParams = [leadId];
  
  dbConnect.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("getApprovalsDetailsById error in controller:", err);
      return res.status(500).json({ error: "Error fetching login details" });
    }
    result = result.map(parseNestedJSON); // Assuming parseNestedJSON function parses nested JSON
    console.log(result);
    res.status(200).json(result);
  });
});


const getDisbursalsDetailsById = asyncHandler((req, res) => {
  console.log(req);
  const leadId = req.params.leadId;
  const sql = `
  SELECT id, approvalDate, lan, program, bankName,  sanctionedAmount, disbursedAmount, sanctionedLetter, repaymentSchedule 
    FROM logins
    WHERE leadId = ? AND approvedStatus = 'disbursed'
  `;
  const queryParams = [leadId];
  
  console.log(queryParams);
  dbConnect.query(sql, queryParams, (err, result) => {
    if (err) {
      console.error("getDisbursalsDetailsById error in controller:", err);
      return res.status(500).json({ error: "Error fetching login details" });
    }
    result = result.map(parseNestedJSON);
    console.log(result);
    res.status(200).json(result);
  });
});

const updateFIPDetails = asyncHandler((req, res) => {
  const updates = req.body; // Assuming req.body is an array of objects containing id, program, bankName, fipStatus, and fipRemarks

  // Prepare the SQL update statement with single CASE WHEN clauses based on id
  let sql = `UPDATE logins SET `;
  let params = [];

  updates.forEach((update, index) => {
    const { id, fipStatus, fipRemarks } = update;
    sql += `
      fipStatus = CASE WHEN id = ? THEN ? ELSE fipStatus END,
      fipRemarks = CASE WHEN id = ? THEN ? ELSE fipRemarks END`;

    params.push(id, fipStatus, id, fipRemarks);

    // Add a comma if not the last update
    if (index !== updates.length - 1) {
      sql += ", ";
    }
  });

  // Add WHERE clause to specify which rows to update based on id
  sql += ` WHERE id IN (${updates.map((update) => "?").join(", ")})`;
  params.push(...updates.map((update) => update.id));

  console.log(sql); // Output the constructed SQL query for debugging
  console.log(params); // Output the parameters for debugging

  // Execute the SQL query
  dbConnect.query(sql, params, (err, result) => {
    if (err) {
      console.error("updateFIPDetails error in query:", err);
      return res.status(500).json({ error: "Error updating FIP details" });
    }

    console.log(result); // Output the query result for debugging
    res.status(200).json({ message: "FIP details updated successfully" });
  });
});

const updateApprovalsDetails = asyncHandler((req, res) => {
  const updates = req.body; // Assuming req.body is an array of objects containing id, program, bankName, lan, sanctionedAmount, disbursedAmount, roi, tenure, approvalDate, approvedStatus, and approvedRemarks

  // Define the fields that can be updated
  const fields = ['program', 'bankName', 'lan', 'sanctionedAmount', 'disbursedAmount', 'roi', 'tenure', 'approvalDate', 'approvedStatus', 'approvedRemarks'];

  let sql = 'UPDATE logins SET ';
  const params = [];

  fields.forEach((field, fieldIndex) => {
    sql += `${field} = CASE `;
    updates.forEach((update, updateIndex) => {
      sql += `WHEN id = ? THEN ? `;
      params.push(update.id, update[field]);
    });
    sql += `ELSE ${field} END`;
    if (fieldIndex < fields.length - 1) {
      sql += ', ';
    }
  });

  // Add WHERE clause to specify which rows to update based on id
  sql += ` WHERE id IN (${updates.map(() => '?').join(', ')})`;
  params.push(...updates.map((update) => update.id));

 
  // Execute the SQL query
  dbConnect.query(sql, params, (err, result) => {
    if (err) {
      console.error("updateApprovalsDetails error in query:", err);
      return res.status(500).json({ error: "Error updating approval details" });
    }

    console.log(result); // Output the query result for debugging
    res.status(200).json({ message: "Approval details updated successfully" });
  });
});

const getApprovalsLeads = asyncHandler(async (req, res) => {
  try {
    const distinctLeadIds = await fetchDistinctApprovedLeadIds();
    let sql = `
      SELECT *
      FROM leads
      WHERE id IN (?)
    `;
    const queryParams = [distinctLeadIds];
    queryParams.push(req.query.sort || "createdOn");
    const filtersQuery = handleGlobalFilters(req.query);
    sql += filtersQuery;

    dbConnect.query(sql, queryParams, (err, result) => {
      if (err) {
        console.error("Error fetching approval details:", err);
        res.status(500).json({ error: "Error fetching approval details" });
        return;
      }
      result = parseNestedJSON(result); // Assuming this function parses nested JSON in the result
      console.log(result);
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
    let sql = `
      SELECT *
      FROM leads
      WHERE id IN (?)
    `;
    const queryParams = [distinctLeadIds];
    queryParams.push(req.query.sort || "createdOn");
    const filtersQuery = handleGlobalFilters(req.query);
    sql += filtersQuery;

    dbConnect.query(sql, queryParams, (err, result) => {
      if (err) {
        console.error("Error fetching disbursal details:", err);
        res.status(500).json({ error: "Error fetching disbursal details" });
        return;
      }
      result = parseNestedJSON(result); // Assuming this function parses nested JSON in the result
      console.log(result);
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
    WHERE approvedStatus = 'disbursed'
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
  const updates = req.body; // Assuming req.body is an array of objects containing id, program, bankName, fipStatus, and fipRemarks

  // Prepare the SQL update statement with single CASE WHEN clauses based on id
  let sql = `UPDATE logins SET `;
  let params = [];

  updates.forEach((update, index) => {
    const { id, sanctionedLetter, repaymentSchedule } = update;
    sql += `
      sanctionedLetter = CASE WHEN id = ? THEN ? ELSE sanctionedLetter END,
      repaymentSchedule = CASE WHEN id = ? THEN ? ELSE repaymentSchedule END`;

    params.push(id, sanctionedLetter, id, repaymentSchedule);

    // Add a comma if not the last update
    if (index !== updates.length - 1) {
      sql += ", ";
    }
  });

  // Add WHERE clause to specify which rows to update based on id
  sql += ` WHERE id IN (${updates.map((update) => "?").join(", ")})`;
  params.push(...updates.map((update) => update.id));

  console.log(sql); // Output the constructed SQL query for debugging
  console.log(params); // Output the parameters for debugging

  // Execute the SQL query
  dbConnect.query(sql, params, (err, result) => {
    if (err) {
      console.error("updateDisbursalDetails error in query:", err);
      return res.status(500).json({ error: "Error updating FIP details" });
    }

    console.log(result); // Output the query result for debugging
    res.status(200).json({ message: "Disbursal details updated successfully" });
  });
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
  updateDisbursalDetails
};
