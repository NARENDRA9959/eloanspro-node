const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const {
  createClauseHandler,
  updateClauseHandler,
} = require("../middleware/clauseHandler");
// const { io, superAdminSockets } = require('../server');
const handleRequiredFields = require("../middleware/requiredFieldsChecker");
const { generateRandomNumber } = require("../middleware/valueGenerator");
const { fetchDistinctApprovedLeadIds } = require("../controllers/loginsController")
const { fetchFIPProcessDistinctLeadIds } = require("../controllers/loginsController")
const { fetchDistinctBankRejectedLeadIds } = require("../controllers/loginsController")
const { fetchDistinctCNIRejectedLeadIds } = require("../controllers/loginsController")
const { fetchDistinctDisbursedLeadIds } = require("../controllers/loginsController")




const getLeadsCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as leadsCount FROM leads";
  const filtersQuery = handleGlobalFilters(req.query, true);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getLeadsCount error in controller");
      return res.status(500).send("Error in Fetching the Leads Count");
    }
    const leadsCount = result[0]["leadsCount"];
    res.status(200).send(String(leadsCount));
  });
});

const getLeads = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM leads";
  const queryParams = req.query;
  queryParams["sort"] = "createdOn";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getLeads Error in controller");
      return res.status(500).send("Error in Fetching the Leads");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

// const getFiles = asyncHandler(async (req, res) => {
//   const queryParams = req.query;

//   // Separate filters for leads and leadDocuments
//   const leadParams = {};
//   const docParams = {};

//   for (const key in queryParams) {
//     if (key.startsWith("docs.")) {
//       docParams[key.replace("docs.", "")] = queryParams[key];
//     } else {
//       leadParams[key] = queryParams[key];
//     }
//   }

//   // Build queries using existing filter functions
//   const leadFilterQuery = handleGlobalFilters(leadParams);
//   const docFilterQuery = handleGlobalFilters(docParams);

//   const leadSql = `SELECT * FROM leads${leadFilterQuery}`;

//   dbConnect.query(leadSql, (leadErr, leadResult) => {
//     if (leadErr) {
//       console.error("Leads query error:", leadErr);
//       return res.status(500).send("Error fetching leads");
//     }

//     leadResult = parseNestedJSON(leadResult);
//     const leadIds = leadResult.map(l => l.id);
//     if (leadIds.length === 0) return res.status(200).send([]);

//     // Base WHERE clause for leadId IN (...)
//     const idsInClause = `leadId IN (${leadIds.map(id => dbConnect.escape(id)).join(",")})`;

//     // Check if docFilterQuery is not empty
//     const docExtraFilters = docFilterQuery.trim();
//     console.log(docExtraFilters)
//     let docSql = `SELECT leadId, createdOn FROM leadDocuments WHERE ${idsInClause}`;
//     if (docExtraFilters.length > 0) {
//       docSql += docExtraFilters.replace(/^WHERE/i, ' AND');
//     }
//     console.log(docSql)
//     dbConnect.query(docSql, (docErr, docResult) => {
//       if (docErr) {
//         console.error("leadDocuments query error:", docErr);
//         return res.status(500).send("Error fetching document data");
//       }
//       const docMap = {};
//       docResult.forEach(doc => {
//         if (!docMap[doc.leadId]) {
//           docMap[doc.leadId] = doc.createdOn;
//         }
//       });
//       const finalResult = leadResult.map(lead => ({
//         ...lead,
//         uploadedDate: docMap[lead.id] || null
//       }));
//       res.status(200).send(finalResult);
//     });
//   });
// });


const getFiles = asyncHandler(async (req, res) => {
  const queryParams = req.query;

  // Separate filters for leads and leadDocuments
  const leadParams = {};
  const docParams = {};

  for (const key in queryParams) {
    if (key.startsWith("docs.")) {
      docParams[key.replace("docs.", "")] = queryParams[key];
    } else {
      leadParams[key] = queryParams[key];
    }
  }

  const leadFilterQuery = handleGlobalFilters(leadParams);
  const docFilterQuery = handleGlobalFilters(docParams);

  // Step 1: Get leadIds from documents matching docFilterQuery
  let docSql = `SELECT leadId, createdOn FROM leaddocuments`;
  if (docFilterQuery.trim().length > 0) {
    docSql += ` ${docFilterQuery}`;
  }

  dbConnect.query(docSql, (docErr, docResult) => {
    if (docErr) {
      console.error("leadDocuments query error:", docErr);
      return res.status(500).send("Error fetching document data");
    }

    if (!docResult.length) return res.status(200).send([]); // No documents match

    // Step 2: Create map for uploadedDate and leadId list
    const docMap = {};
    const docLeadIds = [];

    docResult.forEach(doc => {
      if (!docMap[doc.leadId] || doc.createdOn > docMap[doc.leadId]) {
        docMap[doc.leadId] = doc.createdOn;
      }
      if (!docLeadIds.includes(doc.leadId)) {
        docLeadIds.push(doc.leadId);
      }
    });

    // Step 3: Get leads that match lead filters AND leadId IN (...)
    const leadIdFilter = `id IN (${docLeadIds.map(id => dbConnect.escape(id)).join(",")})`;
    console.log("leadIdFilter", leadIdFilter)
    console.log(leadFilterQuery)
    let fullLeadQuery = `SELECT * FROM leads`;

    if (leadFilterQuery && leadFilterQuery.trim()) {
      // Remove leading WHERE to avoid double WHERE
      const cleanedFilter = leadFilterQuery.trim().replace(/^WHERE\s*/i, '');

      fullLeadQuery += ` WHERE ${leadIdFilter} AND ${cleanedFilter}`;
    } else {
      fullLeadQuery += ` WHERE ${leadIdFilter}`;
    }
    dbConnect.query(fullLeadQuery, (leadErr, leadResult) => {
      if (leadErr) {
        console.error("Leads query error:", leadErr);
        return res.status(500).send("Error fetching leads");
      }
      console.log(fullLeadQuery)
      leadResult = parseNestedJSON(leadResult);
      const finalResult = leadResult.map(lead => ({
        ...lead,
        uploadedDate: docMap[lead.id] || null
      }));

      res.status(200).send(finalResult);
    });
  });
});

const getFilesCount = asyncHandler(async (req, res) => {
  const queryParams = req.query;

  // Separate filters for leads and leadDocuments
  const leadParams = {};
  const docParams = {};

  for (const key in queryParams) {
    if (key.startsWith("docs.")) {
      docParams[key.replace("docs.", "")] = queryParams[key];
    } else {
      leadParams[key] = queryParams[key];
    }
  }

  // Build queries using existing filter functions
  const leadFilterQuery = handleGlobalFilters(leadParams, true);
  const docFilterQuery = handleGlobalFilters(docParams, true);

  const leadSql = `SELECT id FROM leads ${leadFilterQuery}`;

  dbConnect.query(leadSql, (leadErr, leadResult) => {
    if (leadErr) {
      console.error("Leads query error:", leadErr);
      return res.status(500).send("Error fetching leads");
    }

    const leadIds = leadResult.map(l => l.id);
    if (leadIds.length === 0) return res.status(200).send({ count: 0 });

    // Build WHERE clause for leadId IN (...)
    const idsInClause = `leadId IN (${leadIds.map(id => dbConnect.escape(id)).join(",")})`;

    let docSql = `SELECT COUNT(DISTINCT leadId) AS count FROM leaddocuments WHERE ${idsInClause}`;

    const docExtraFilters = docFilterQuery.trim();
    if (docExtraFilters.length > 0) {
      docSql += docExtraFilters.replace(/^WHERE/i, ' AND');
    }

    dbConnect.query(docSql, (docErr, docResult) => {
      if (docErr) {
        console.error("leadDocuments count query error:", docErr);
        return res.status(500).send("Error fetching document count");
      }
      const count = docResult[0]?.count || 0;
      res.status(200).send(String(count));
    });
  });
});

const getLeadSources = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM leadsources";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getLeadUSoucres error in controller");
      return res.status(500).send("Error in Fetching the Lead Sources");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const getLeadById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM leads WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getLeadById error in controller");
      return res.status(500).send("Error in Fetching the Lead Details");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const getLeadDocumentsById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM leaddocuments WHERE leadId = ${req.params.leadId}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getLeadDocumentsById Error in controller");
      return res.status(500).send("Error in Fetching the Lead Documents");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result[0] || {});
  });
});

const addDocumentData = asyncHandler((req, res) => {
  const id = req.params.leadId;
  req.body["lastUpdatedBy"] = req.user.name;
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE leaddocuments SET ${updateClause} WHERE leadId = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("addDocumentData error in controller");
      return res.status(500).send("Error in Adding the Documents");
    }
    res.status(200).send({ success: "Documents Saved Successfully" });
  });
});

// const addDocumentData = asyncHandler((req, res) => {
//   const id = req.params.leadId;
//   req.body["lastUpdatedBy"] = req.user.name;
//   console.log(req.body)
//   const updateClause = updateClauseHandler(req.body);
//   const sql = `UPDATE leaddocuments SET ${updateClause} WHERE leadId = ${id}`;

//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("addDocumentData error in controller");
//       return res.status(500).send("Error in Adding the Documents");
//     }

//     // Emit only to Super Admins
//     console.log("superAdminSockets", global.superAdminSockets)

//     for (let key in global.superAdminSockets) {
//       global.superAdminSockets[key].socket.emit('documentAdded', {
//         message: `New document updated by ${req.user.name} for lead ${id}`,
//         leadId: id,
//         updatedBy: req.user.name
//       });
//     }

//     res.status(200).send({ success: "Documents Saved Successfully" });
//   });
// });
const addDscrValuesData = asyncHandler((req, res) => {
  const id = req.params.leadId;
  req.body["lastUpdatedBy"] = req.user.name;
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE dscr_values SET ${updateClause} WHERE leadId = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("addDscrValuesData error in controller");
    }
    res.status(200).send({ success: "Dscr Values  Saved Successfully" });
  });
});

const getDscrValuesById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM dscr_values WHERE leadId = ${req.params.leadId}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getDscrValuesById Error in controller");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result[0] || {});
  });
});

const calculateGstProgram = asyncHandler((req, res) => {
  const { totalEmi, odCcInterestAy1, gstTurnover, margin, months } = req.body;
  const margin1 = margin / 100;
  const monthlyInterest = (gstTurnover * margin1) / months;
  const monthlyPayment = monthlyInterest * 0.8;
  const finalMonthlyPayment = monthlyPayment - totalEmi - odCcInterestAy1;
  const gstValue = Math.round(finalMonthlyPayment);
  req.body["lastUpdatedBy"] = req.user.name;
  const updateClause = updateClauseHandler(req.body);
  if (!updateClause) {
    return res.status(400).json({ error: "No update values provided" });
  }
  const extendedUpdateClause = `${updateClause}, gstValue = ${gstValue}`;
  const sql = `
    UPDATE dscr_values
    SET ${extendedUpdateClause}
    WHERE leadId = ${req.params.leadId}
  `;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error updating data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No rows updated" });
    }
    res.json({ gstValue });
  });
});
const calculateBalanceSheet = asyncHandler((req, res) => {
  const {
    capitalAy1,
    sundryDebtorsAy1,
    sundryCreditorsAy1,
    turnoverAy1,
    purchasesAy1,
  } = req.body;
  const debtNumerator = sundryDebtorsAy1 * 365;
  const creditNumerator = sundryCreditorsAy1 * 365;
  const debtDenominator = turnoverAy1;
  const creditDenominator = purchasesAy1;
  const debtor_daysFirstYear =
    debtDenominator !== 0 ? debtNumerator / debtDenominator : 0;
  const creditor_daysFirstYear =
    creditDenominator !== 0 ? creditNumerator / creditDenominator : 0;
  req.body["lastUpdatedBy"] = req.user.name;
  const updateClause = updateClauseHandler(req.body);
  if (!updateClause) {
    return res.status(400).json({ error: "No update values provided" });
  }
  const extendedUpdateClause = `${updateClause}, debtor_daysFirstYear = ${debtor_daysFirstYear}, creditor_daysFirstYear=${creditor_daysFirstYear}`;
  const sql = `
    UPDATE dscr_values
    SET ${extendedUpdateClause}
    WHERE leadId = ${req.params.leadId}
  `;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error updating data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No rows updated" });
    }
    res.json({ creditor_daysFirstYear, debtor_daysFirstYear });
  });
});

const calculateDscrRatio = asyncHandler((req, res) => {
  const {
    profitaftertaxAy1,
    depreciationAy1,
    directorsRemuAy1,
    partnerRemuAy1,
    partnerInterestAy1,
    totalEmi,
    proposedEmi,
    odCcInterestAy1,
    monthsAy1,
  } = req.body;
  let numerator = 0;
  if (directorsRemuAy1) {
    numerator = profitaftertaxAy1 + depreciationAy1 + directorsRemuAy1;
  } else if (partnerRemuAy1 && partnerInterestAy1) {
    numerator =
      profitaftertaxAy1 + depreciationAy1 + partnerRemuAy1 + partnerInterestAy1;
  } else {
    numerator = profitaftertaxAy1 + depreciationAy1;
  }
  const denominator = (totalEmi + proposedEmi + odCcInterestAy1) * monthsAy1;
  const resultFirstYear =
    denominator !== 0 ? (numerator / denominator).toFixed(2) : 0;
  req.body["lastUpdatedBy"] = req.user.name;
  const updateClause = updateClauseHandler(req.body);
  const extendedUpdateClause = `${updateClause},  resultFirstYear=${resultFirstYear}`;
  const sql = `
    UPDATE dscr_values
    SET ${extendedUpdateClause}
    WHERE leadId = ${req.params.leadId}
  `;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error updating data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No rows updated" });
    }
    res.json({ resultFirstYear });
  });
});

const calculateBTOProgram = asyncHandler((req, res) => {
  const { totalEmi, odCcInterestAy1, bankingTurnover, btoMargin, btoMonths } =
    req.body;
  const margin1 = btoMargin / 100;
  const monthlyInterest = (bankingTurnover * margin1) / btoMonths;
  const monthlyPayment = monthlyInterest * 0.8; // 80% of monthly interest
  const finalMonthlyPayment = monthlyPayment - totalEmi - odCcInterestAy1;
  const btoValue = Math.round(finalMonthlyPayment);
  req.body["lastUpdatedBy"] = req.user.name;
  const updateClause = updateClauseHandler(req.body);
  if (!updateClause) {
    return res.status(400).json({ error: "No update values provided" });
  }
  const extendedUpdateClause = `${updateClause}, btoValue = ${btoValue}`;
  const sql = `
    UPDATE dscr_values
    SET ${extendedUpdateClause}
    WHERE leadId = ${req.params.leadId}
  `;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error updating data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No rows updated" });
    }
    res.json({ btoValue });
  });
});

const searchLeads = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM leads";
  const queryParams = req.query;
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(sql, async (err, leadsResult) => {
    if (err) {
      console.log("getLeads Error in controller");
      return res.status(500).send({ message: "Internal Server Error" });
    }
    leadsResult = parseNestedJSON(leadsResult);
    if (leadsResult.length === 0) {
      return res.status(404).send("No Leads Found.");
    }
    const statusSql = "SELECT id, displayName FROM leadstatus";
    dbConnect.query(statusSql, async (err, statusResult) => {
      if (err) {
        console.log("Error fetching lead statuses");
        return res.status(500).send({ message: "Internal Server Error" });
      }
      const statusMap = {};
      statusResult.forEach(status => {
        statusMap[status.id] = status.displayName;
      });
      try {
        const approvedLeadIds = await fetchDistinctApprovedLeadIds();
        const fipLeadsIds = await fetchFIPProcessDistinctLeadIds();
        const bankRejectedLeadsIds = await fetchDistinctBankRejectedLeadIds();
        const disbursalIds = await fetchDistinctDisbursedLeadIds();
        const cniIds = await fetchDistinctCNIRejectedLeadIds();
        const processedLeads = leadsResult.map(lead => {
          let leadStatusName;
          if (lead.leadInternalStatus == 12) {
            if (approvedLeadIds.includes(lead.id.toString()) && disbursalIds.includes(lead.id.toString())) {
              leadStatusName = "Disbursed";
            } else if (approvedLeadIds.includes(lead.id.toString())) {
              leadStatusName = "Sanctions";
            } else if (fipLeadsIds.includes(lead.id.toString())) {
              leadStatusName = "Files In Process";
            } else if (bankRejectedLeadsIds.includes(lead.id.toString())) {
              leadStatusName = "Bank Rejects";
            } else if (cniIds.includes(lead.id.toString())) {
              leadStatusName = "CNI";
            } else {
              leadStatusName = statusMap[lead.leadInternalStatus] || lead.leadInternalStatus;
            }
          } else {
            leadStatusName = statusMap[lead.leadInternalStatus] || lead.leadInternalStatus;
          }
          return {
            ...lead,
            leadStatusName,
          };
        });
        res.status(200).send({
          message: "Leads fetched successfully.",
          leadDetails: processedLeads,
        });
      } catch (error) {
        console.log("Error processing leads", error);
        return res.status(500).send({ message: "Internal Server Error" });
      }
    });
  });
});


async function fetchTeamData() {
  const sql = `
    SELECT *
    FROM users;
  `;
  return new Promise((resolve, reject) => {
    dbConnect.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

const getSourceName = async (userId) => {
  try {
    const teamData = await fetchTeamData();
    const teamMember = teamData.find((member) => member.id == userId);
    console.log(teamMember)
    return teamMember ? teamMember.name : "";
  } catch (error) {
    console.error("Error getting sourcedBy names:", error);
    throw error;
  }
};

const createLead = asyncHandler(async (req, res) => {
  const phoneNumber = req.body.primaryPhone;
  if (req.user.userType == 1) {
    return createNewLead(req, res);
  }
  const checkPhoneQuery = `SELECT * FROM leads WHERE primaryPhone = ?`;
  dbConnect.query(checkPhoneQuery, [phoneNumber], async (err, result) => {
    if (err) {
      console.error("Error checking phone number:", err);
      return res.status(500).send("Error in checking phone number");
    }
    if (result.length > 0) {
      const lead = result[0];
      try {
        const sourcedByName = await getSourceName(lead.sourcedBy);
        return res.status(400).send(
          `Lead already exists with phone number ${phoneNumber}, 
          Lead ID - ${lead.id}, Business Name - ${lead.businessName}, 
          Created By - ${lead.createdBy}, Sourced By - ${sourcedByName}`
        );
      } catch (error) {
        console.error("Error fetching sourcedBy name:", error);
        return res.status(500).send("Error fetching sourcedBy name");
      }
    }
    createNewLead(req, res);
  });
});

function createNewLead(req, res) {
  let leadId = "L-" + generateRandomNumber(6);
  let id = generateRandomNumber(9);
  req.body["id"] = id;
  req.body["leadId"] = leadId;
  req.body["leadInternalStatus"] = 1;
  req.body["lastLeadInternalStatus"] = 1;
  req.body["createdBy"] = req.user.name;
  req.body["lastUpdatedBy"] = req.user.name;
  const createClause = createClauseHandler(req.body);
  const sql = `INSERT INTO leads (${createClause[0]}) VALUES (${createClause[1]})`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error inserting data into leads table:", err);
      res.status(500).send("Internal server error");
      return;
    }
    res.status(200).send(true);
  });
}

const createLeadFromCallback = asyncHandler(async (req, res) => {
  const phoneNumber = req.body.primaryPhone;
  if (req.user.userType == 1) {
    return createNewLeadFromCallback(req, res);
  }
  const checkPhoneQuery = `SELECT * FROM leads WHERE primaryPhone = ?`;
  dbConnect.query(checkPhoneQuery, [phoneNumber], async (err, result) => {
    if (err) {
      console.error("Error checking phone number:", err);
      return res.status(500).send("Error in Checking the Phone Number");
    }
    if (result.length > 0) {
      const lead = result[0];
      try {
        const sourcedByName = await getSourceName(lead.sourcedBy);
        return res.status(400).send(
          `Lead already exists with phone number ${phoneNumber}, 
         Lead ID - ${lead.id}, Business Name - ${lead.businessName}, 
         Created By - ${lead.createdBy},  Sourced By - ${sourcedByName}`
        );
      } catch (error) {
        console.error("Error fetching sourcedBy name:", error);
        return res.status(500).send("Error fetching sourcedBy name");
      }
    }
    createNewLeadFromCallback(req, res);
  });
});

function createNewLeadFromCallback(req, res) {
  let leadId = "L-" + generateRandomNumber(6);
  let id = generateRandomNumber(9);
  req.body["id"] = id;
  req.body["leadId"] = leadId;
  req.body["leadInternalStatus"] = 1;
  req.body["lastLeadInternalStatus"] = 1;
  req.body["createdBy"] = req.user.name;
  req.body["lastUpdatedBy"] = req.user.name;
  const createClause = createClauseHandler(req.body);
  const sql = `INSERT INTO leads (${createClause[0]}) VALUES (${createClause[1]})`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error inserting data into leads table:", err);
      res.status(500).send("Internal server error");
      return;
    }
    console.log(id)
    res.status(200).json({ id: id });
  });
}

function updateNewLead(req, res) {
  const id = req.params.id;
  req.body["lastUpdatedBy"] = req.user.name;
  const updateClause = updateClauseHandler(req.body);
  const updateSql = `UPDATE leads SET ${updateClause} WHERE id = ?`;
  dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
    if (updateErr) {
      console.error("updateLead error in controller:", updateErr);
      return res.status(500).send("Error in Updating the Lead");
    }
    return res.status(200).send(updateResult);
  });
}

const updateLead = asyncHandler(async (req, res) => {
  const checkRequiredFields = handleRequiredFields("leads", req.body);
  if (!checkRequiredFields) {
    return res.status(422).send("Please fill all required fields");
  }
  if (req.user.userType == 1) {
    return updateNewLead(req, res);
  }
  const { primaryPhone } = req.body;
  const id = req.params.id;
  const checkPhoneQuery = `SELECT * FROM leads WHERE primaryPhone = ? AND id != ?`;
  dbConnect.query(checkPhoneQuery, [primaryPhone, id], async (err, result) => {
    if (err) {
      console.error("Error checking phone number:", err);
      return res.status(500).send("Error in checking the phone number");
    }
    if (result.length > 0) {
      const lead = result[0];
      try {
        const sourcedByName = await getSourceName(lead.sourcedBy);
        return res.status(400).send(
          `Lead already exists with phone number ${primaryPhone}, 
         Lead ID - ${lead.id}, Business Name - ${lead.businessName}, 
         Created By - ${lead.createdBy},  Sourced By - ${sourcedByName}`
        );
      } catch (error) {
        console.error("Error fetching sourcedBy name:", error);
        return res.status(500).send("Error fetching sourcedBy name");
      }
    }
    updateNewLead(req, res);
  });
});
// const deleteLead = asyncHandler((req, res) => {
//   const sql = `DELETE FROM leads WHERE id = ${req.params.id}`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("deleteLead error in controller");
//     }
//     res.status(200).send("Lead Deleted Successfully");
//   });
// });
const deleteLead = asyncHandler((req, res) => {
  const sql = `DELETE FROM leads WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("deleteLead error:", err);
      return res.status(500).send("Error In Deleting the Lead");
    }
    res.status(200).json({ message: "Lead Deleted Successfully" });
  });
});

const changeLeadStatus = asyncHandler((req, res) => {
  const id = req.params.leadId;
  const statusId = req.params.statusId;
  const createSql = `SELECT * FROM leads WHERE id = ${id}`;
  dbConnect.query(createSql, (err, result) => {
    if (err) {
      console.log("changeLeadStatus error in controller");
      return res.status(500).send("Error in Checking The Lead");
    }
    if (result && result[0] && statusId) {
      let statusData = {
        lastLeadInternalStatus: result[0].leadInternalStatus,
        leadInternalStatus: statusId,
      };
      const updateClause = updateClauseHandler(statusData);
      const sql = `UPDATE leads SET ${updateClause} WHERE id = ${id}`;
      dbConnect.query(sql, (err, result) => {
        if (err) {
          console.log("changeLeadStatus error in controller");
          return res.status(500).send("Error in Updating The Lead Status");
        }
        res.status(200).send(true);
      });
    } else {
      res.status(422).send("No Leads Found");
    }
  });
});

const getCreditSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let sql = `SELECT creditSummary FROM dscr_values WHERE leadId = ?`;
  dbConnect.query(sql, [id], (err, result) => {
    if (err) {
      console.error("getCreditSummary error:", err);
      return res.status(500).send("Error retrieving credit summary");
    }
    if (result.length === 0) {
      return res.status(404).send("No Remarks Found ");
    }
    const creditSummary = result[0].creditSummary;
    res.status(200).json({ creditSummary });
  });
});
// const getAllLeadData = asyncHandler(async (req, res) => {
//   console.log(req.params.leadId)
//   const leadId = req.params.leadId;

//   // Query to get lead details
//   const leadQuery = `SELECT * FROM leads WHERE id = ?`;
//   const documentsQuery = `SELECT * FROM leaddocuments WHERE leadId = ?`;
//   const crditsQuery = `SELECT * FROM dscr_values WHERE leadId = ?`;
//   const loginsQuery = `SELECT * FROM logins WHERE leadId = ?`;

//   // Start by getting lead details
//   dbConnect.query(leadQuery, [leadId], (err, leadResults) => {
//     if (err) return res.status(500).json({ error: 'Error fetching lead details' });

//     if (leadResults.length === 0) return res.status(404).json({ message: 'Lead not found' });

//     const leadData = leadResults[0]; // Assuming one result for leadId

//     // Now get the documents associated with the lead
//     dbConnect.query(documentsQuery, [leadId], (err, documentResults) => {
//       if (err) return res.status(500).json({ error: 'Error fetching document details' });

//       // Now get credit details
//       dbConnect.query(crditsQuery, [leadId], (err, creditsResults) => {
//         if (err) return res.status(500).json({ error: 'Error fetching credit details' });

//         // Now get login details
//         dbConnect.query(loginsQuery, [leadId], (err, loginResults) => {
//           if (err) return res.status(500).json({ error: 'Error fetching login details' });

//           // If no login data found, set it as an empty array
//           const loginData = loginResults.length > 0 ? loginResults : [];
//           const documentData = documentResults[0];
//           const creditData = creditsResults[0];
//           // Combine all data into one response
//           const responseData = {
//             leadData,
//             documents: documentData ? documentData : null,
//             logins: loginData, // Handling multiple rows for logins
//             credits: creditData ? creditData : null// Handling multiple rows for credits
//           };


//           const result = parseNestedJSON(responseData);
//           res.status(200).send(result);
//         });
//       });
//     });
//   });
// });
const getAllLeadData = asyncHandler(async (req, res) => {
  const leadId = req.params.leadId;

  // Query to get lead details
  const leadQuery = `SELECT * FROM leads WHERE id = ?`;
  const documentsQuery = `SELECT * FROM leaddocuments WHERE leadId = ?`;
  const creditsQuery = `SELECT * FROM dscr_values WHERE leadId = ?`;
  const loginsQuery = `SELECT * FROM logins WHERE leadId = ?`;

  try {
    // Fetch lead details
    const [leadResults] = await dbConnect.promise().query(leadQuery, [leadId]);
    if (leadResults.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    const leadData = leadResults[0]; // Lead details

    // Fetch distinct lead IDs for status determination
    const approvedLeadIds = await fetchDistinctApprovedLeadIds();
    const fipLeadsIds = await fetchFIPProcessDistinctLeadIds();
    const bankRejectedLeadsIds = await fetchDistinctBankRejectedLeadIds();
    const disbursalIds = await fetchDistinctDisbursedLeadIds();
    const cniIds = await fetchDistinctCNIRejectedLeadIds();

    // Function to get status name based on internal status
    const getLeadStatusName = (lead) => {
      const leadIdStr = lead.id.toString();
      const internalStatus = lead.leadInternalStatus;

      if (internalStatus == 12) { // Files In Process block
        if (approvedLeadIds.includes(leadIdStr) && disbursalIds.includes(leadIdStr)) {
          return "Disbursed";
        } else if (approvedLeadIds.includes(leadIdStr)) {
          return "Sanctions";
        } else if (fipLeadsIds.includes(leadIdStr)) {
          return "Files In Process";
        } else if (bankRejectedLeadsIds.includes(leadIdStr)) {
          return "Bank Rejects";
        } else if (cniIds.includes(leadIdStr)) {
          return "CNI";
        } else {
          return internalStatus; // Fallback
        }
      } else {
        return internalStatus; // Fallback for other statuses
      }
    };

    // Fetch additional data based on the lead's status
    const [documentResults] = await dbConnect.promise().query(documentsQuery, [leadId]);
    const [creditsResults] = await dbConnect.promise().query(creditsQuery, [leadId]);
    const [loginResults] = await dbConnect.promise().query(loginsQuery, [leadId]);

    const loginData = loginResults.length > 0 ? loginResults : [];
    const documentData = documentResults.length > 0 ? documentResults[0] : null;
    const creditData = creditsResults.length > 0 ? creditsResults[0] : null;

    // If leadInternalStatus is 12, include leadStatusName
    if (leadData.leadInternalStatus == 12) {
      const leadStatusName = getLeadStatusName(leadData); // Get status name

      // Combine all data into one response
      const responseData = {
        leadData,
        leadStatusName,
        documents: documentData,
        logins: loginData,
        credits: creditData
      };
      return res.status(200).send(parseNestedJSON(responseData));
    }

    // If leadInternalStatus is not 12, proceed without leadStatusName
    const responseData = {
      leadData,
      documents: documentData,
      logins: loginData,
      credits: creditData
    };
    return res.status(200).send(parseNestedJSON(responseData));

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error fetching lead data' });
  }
});


const getInhouseRejectedLeads = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM leads";
  const queryParams = req.query;
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;

  dbConnect.query(sql, async (err, leads) => {
    if (err) {
      console.log("Error fetching leads");
      return res.status(500).send("Error in Fetching the Leads");
    }

    leads = parseNestedJSON(leads);
    const leadIds = leads.map((lead) => lead.id);
    if (leadIds.length === 0) return res.status(200).send([]);

    // Step 1: Fetch creditSheetSummary for each leadId
    const creditSql = `
      SELECT leadId, creditSummary 
      FROM dscr_values 
      WHERE leadId IN (?)
    `;
    dbConnect.query(creditSql, [leadIds], (err, creditRows) => {
      if (err) {
        console.log("Error fetching credit sheet summaries");
        return res.status(500).send("Error fetching credit summary data");
      }
      // Step 2: Map credit summaries to leadId
      const creditMap = {};
      creditRows.forEach((row) => {
        creditMap[row.leadId] = row.creditSummary;
      });
      // Step 3: Merge into leads
      const result = leads.map((lead) => ({
        ...lead,
        creditSummary: creditMap[lead.id] || null,
      }));
      res.status(200).send(result);
    });
  });
});

module.exports = {
  getLeads,
  getLeadSources,
  getCreditSummary,
  getLeadsCount,
  getLeadById,
  getLeadDocumentsById,
  createLead,
  updateLead,
  deleteLead,
  changeLeadStatus,
  calculateGstProgram,
  addDocumentData,
  addDscrValuesData,
  getDscrValuesById,
  calculateBalanceSheet,
  calculateDscrRatio,
  calculateBTOProgram,
  searchLeads,
  createLeadFromCallback,
  getSourceName,
  getAllLeadData,
  getInhouseRejectedLeads,
  getFiles,
  getFilesCount
};
