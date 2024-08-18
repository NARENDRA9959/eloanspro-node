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
const { fetchDistinctApprovedLeadIds } = require("../controllers/loginsController")
const { fetchFIPProcessDistinctLeadIds } = require("../controllers/loginsController")
const { fetchDistinctBankRejectedLeadIds } = require("../controllers/loginsController")
const { fetchDistinctDisbursedLeadIds } = require("../controllers/loginsController")




const getLeadsCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as leadsCount FROM leads";
  const filtersQuery = handleGlobalFilters(req.query, true);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getLeadsCount error in controller");
    }
    const leadsCount = result[0]["leadsCount"];
    res.status(200).send(String(leadsCount));
  });
});

const getLeads = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM leads";
  const queryParams = req.query;
  queryParams["sort"] = "lastUpdatedOn";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  // console.log(sql)
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getLeads Error in controller");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const getLeadSources = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM leadsources";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getLeadUSoucres error in controller");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const getLeadUsers = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM users";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getLeadUsers error in controller");
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
    }
    result = parseNestedJSON(result);
    res.status(200).send(result[0] || {});
  });
});

const addDocumentData = asyncHandler((req, res) => {
  const id = req.params.leadId;
  const updateClause = updateClauseHandler(req.body);
  // console.log(updateClause);
  // console.log(id);
  const sql = `UPDATE leaddocuments SET ${updateClause} WHERE leadId = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("addDocumentData error in controller");
    }
    res.status(200).send({ success: "Documents Saved Successfully" });
  });
});

const addDscrValuesData = asyncHandler((req, res) => {
  const id = req.params.leadId;
  const updateClause = updateClauseHandler(req.body);
  // console.log(updateClause);
  // console.log(id);
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


// IMPORTANT CODE

// const createLead = asyncHandler((req, res) => {
//   const phoneNumber = req.body.primaryPhone;
//   const checkPhoneQuery = `SELECT leads.*, leadstatus.displayName 
//     FROM leads 
//     LEFT JOIN leadstatus ON leads.leadInternalStatus = leadstatus.id 
//     WHERE leads.primaryPhone = ?`;
//   dbConnect.query(checkPhoneQuery, [phoneNumber], (err, result) => {
//     if (err) {
//       console.error("Error checking phone number:", err);
//       res.status(500).json({ error: "Internal server error" });
//     } else {
//       if (result.length > 0) {
//         const lead = result[0];
//         res
//           .status(500)
//           .send(
//             `Lead already exists with phone number ${phoneNumber}, created by - ${lead.createdBy}, Lead id - ${lead.id}, lead Status - ${lead.displayName}`
//           );
//       } else {
//         let leadId = "L-" + generateRandomNumber(6);
//         let id = generateRandomNumber(9);
//         req.body["id"] = id;
//         req.body["leadId"] = leadId;
//         req.body["leadInternalStatus"] = 1;
//         req.body["lastLeadInternalStatus"] = 1;
//         req.body["createdBy"] = req.user.name;
//         req.body["lastUpdatedBy"] = req.user.name;
//         const createClause = createClauseHandler(req.body);
//         const sql = `INSERT INTO leads (${createClause[0]}) VALUES (${createClause[1]})`;
//         dbConnect.query(sql, (err, result) => {
//           if (err) {
//             console.error("Error inserting data into leads table:", err);
//             res.status(500).send("Internal server error");
//             return;
//           }
//           res.status(200).send(true);
//         });
//       }
//     }
//   });
// });
//another imp
// const createLead = asyncHandler((req, res) => {
//   console.log(req.user.userType);
//   const phoneNumber = req.body.primaryPhone;
//   //console.log(phoneNumber);
//   const checkPhoneQuery = `SELECT * FROM leads WHERE primaryPhone = ?`;
//   dbConnect.query(checkPhoneQuery, [phoneNumber], (err, result) => {
//     if (err) {
//       console.error("Error checking phone number:", err);
//       res.status(500).json({ error: "Internal server error" });
//     } else {
//       if (result.length > 0) {
//         const lead = result[0];
//         res
//           .status(500)
//           .send(
//             `Lead already exists with phone number ${phoneNumber}, created by - ${lead.createdBy}, Lead id - ${lead.id}`
//           );
//       } else {
//         let leadId = "L-" + generateRandomNumber(6);
//         let id = generateRandomNumber(9);
//         req.body["id"] = id;
//         req.body["leadId"] = leadId;
//         req.body["leadInternalStatus"] = 1;
//         req.body["lastLeadInternalStatus"] = 1;
//         req.body["createdBy"] = req.user.name;
//         req.body["lastUpdatedBy"] = req.user.name;
//         // console.log(req.user.name)
//         const createClause = createClauseHandler(req.body);
//         const sql = `INSERT INTO leads (${createClause[0]}) VALUES (${createClause[1]})`;
//         dbConnect.query(sql, (err, result) => {
//           if (err) {
//             console.error("Error inserting data into leads table:", err);
//             res.status(500).send("Internal server error");
//             return;
//           }
//           res.status(200).send(true);
//         });
//       }
//     }
//   });
// });
const searchLeads = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM leads";
  const queryParams = req.query;
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  console.log(sql);
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



        // Process each lead in the array
        const processedLeads = leadsResult.map(lead => {
          let leadStatusName;

          if (lead.leadInternalStatus == 12) {
            if (approvedLeadIds.includes(lead.id.toString()) && disbursalIds.includes(lead.id.toString())) {
              leadStatusName = "Disbursal";
            } else if (approvedLeadIds.includes(lead.id.toString())) {
              leadStatusName = "Sanctions";
            } else if (fipLeadsIds.includes(lead.id.toString())) {
              leadStatusName = "Files In Process";
            } else if (bankRejectedLeadsIds.includes(lead.id.toString())) {
              leadStatusName = "Bank Rejects";
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

        console.log(processedLeads);
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



const createLead = asyncHandler((req, res) => {
  console.log(req.user.userType);
  const phoneNumber = req.body.primaryPhone;
  if (req.user.userType == 1) {
    createNewLead(req, res);
  } else {
    const checkPhoneQuery = `SELECT * FROM leads WHERE primaryPhone = ?`;
    dbConnect.query(checkPhoneQuery, [phoneNumber], (err, result) => {
      if (err) {
        console.error("Error checking phone number:", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        console.log(result)
        if (result.length > 0) {
          const lead = result[0];
          res
            .status(500)
            .send(
              `Lead already exists with phone number ${phoneNumber}, created by - ${lead.createdBy}, Lead id - ${lead.id}, Buisness Name - ${lead.businessName}`
            );
        } else {
          createNewLead(req, res);
        }
      }
    });
  }
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

// const updateLead = asyncHandler((req, res) => {
//   const id = req.params.id;
//   console.log(req.body)
//   const checkRequiredFields = handleRequiredFields("leads", req.body);
//   if (!checkRequiredFields) {
//     res.status(422).send("Please Fill all required fields");
//     return;
//   }
//   const updateClause = updateClauseHandler(req.body);
//   const sql = `UPDATE leads SET ${updateClause} WHERE id = ${id}`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("updateLead error in controller");
//     }
//     res.status(200).send(result);
//   });
// });


const updateLead = asyncHandler((req, res) => {
  const id = req.params.id;
  const { primaryPhone } = req.body;
  const checkRequiredFields = handleRequiredFields("leads", req.body);
  if (!checkRequiredFields) {
    return res.status(422).send("Please fill all required fields");
  }
  const checkPhoneQuery = `SELECT * FROM leads WHERE primaryPhone = ? AND id != ?`;
  dbConnect.query(checkPhoneQuery, [primaryPhone, id], (err, result) => {
    if (err) {
      console.error("Error checking phone number:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (result.length > 0) {
      console.log(result)
      const lead = result[0];
      return res
        .status(409)
        .send(
          `Lead already exists with phone number ${primaryPhone}, created by - ${lead.createdBy}, Lead ID - ${lead.id}, Business Name - ${lead.businessName}`
        );
    }
    const updateClause = updateClauseHandler(req.body);
    const updateSql = `UPDATE leads SET ${updateClause} WHERE id = ?`;
    dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("updateLead error in controller:", updateErr);
        return res.status(500).send("Internal server error");
      }
      return res.status(200).send(updateResult);
    });
  });
});

const deleteLead = asyncHandler((req, res) => {
  const sql = `DELETE FROM leads WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("deleteLead error in controller");
    }
    res.status(200).send("Lead Deleted Successfully");
  });
});

const changeLeadStatus = asyncHandler((req, res) => {
  const id = req.params.leadId;
  const statusId = req.params.statusId;
  const createSql = `SELECT * FROM leads WHERE id = ${id}`;
  dbConnect.query(createSql, (err, result) => {
    if (err) {
      console.log("changeLeadStatus error in controller");
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

module.exports = {
  getLeads,
  getLeadSources,
  getLeadUsers,
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
  searchLeads
};
