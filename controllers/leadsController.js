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
  queryParams["sort"] = "createdOn";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
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
  console.log(updateClause);
  console.log(id);
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
  console.log(updateClause);
  console.log(id);
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
  const monthlyPayment = monthlyInterest * 0.8; // 80% of monthly interest
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

// const createLead = asyncHandler((req, res) => {
//   console.log(req);
//   const phoneNumber = req.body.primaryPhone;
//   console.log(phoneNumber);
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
//             `Lead already exists with phone number ${phoneNumber}, created by ${lead.createdBy}`
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

//         // Execute the SQL query to insert data into the "leads" table
//         dbConnect.query(sql, (err, result) => {
//           if (err) {
//             console.error("Error inserting data into leads table:", err);
//             res.status(500).send("Internal server error");
//             return;
//           }

//           // Construct the SQL query for inserting the id into the "leaddocuments" table
//           const leaddocumentsSql = `INSERT INTO leaddocuments (leadId) VALUES ('${id}')`;

//           // Execute the SQL query to insert the id into the "leaddocuments" table
//           dbConnect.query(leaddocumentsSql, (leaddocumentsErr) => {
//             if (leaddocumentsErr) {
//               console.error(
//                 "Error inserting id into leaddocuments table:",
//                 leaddocumentsErr
//               );
//               res
//                 .status(500)
//                 .send(`Failed to insert id ${id} into leaddocuments table`);
//               return;
//             }

//             console.log("ID inserted into leaddocuments successfully:", id);

//             // Construct the SQL query for inserting the id into the "dscr_value" table
//             const dscrValueSql = `INSERT INTO dscr_values (leadid) VALUES ('${id}')`;

//             // Execute the SQL query to insert the id into the "dscr_value" table
//             dbConnect.query(dscrValueSql, (dscrValueErr) => {
//               if (dscrValueErr) {
//                 console.error(
//                   "Error inserting id into dscr_value table:",
//                   dscrValueErr
//                 );
//                 res
//                   .status(500)
//                   .send(`Failed to insert id ${id} into dscr_value table`);
//                 return;
//               }

//               console.log("ID inserted into dscr_value successfully:", id);
//               res.status(200).send(true);

//               // Send response after both insertions are complete
//             });
//           });
//         });
//       }
//     }
//   });
// });

const createLead = asyncHandler((req, res) => {
  console.log(req);
  const phoneNumber = req.body.primaryPhone;
  console.log(phoneNumber);
  const checkPhoneQuery = `SELECT * FROM leads WHERE primaryPhone = ?`;
  dbConnect.query(checkPhoneQuery, [phoneNumber], (err, result) => {
    if (err) {
      console.error("Error checking phone number:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      if (result.length > 0) {
        const lead = result[0];
        res
          .status(500)
          .send(
            `Lead already exists with phone number ${phoneNumber}, created by ${lead.createdBy}`
          );
      } else {
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
          const leaddocumentsSql = `INSERT INTO leaddocuments (leadId) VALUES ('${id}')`;
          dbConnect.query(leaddocumentsSql, (leaddocumentsErr) => {
            if (leaddocumentsErr) {
              console.error(
                "Error inserting id into leaddocuments table:",
                leaddocumentsErr
              );
              res
                .status(500)
                .send(`Failed to insert id ${id} into leaddocuments table`);
              return;
            }
            console.log("ID inserted into leaddocuments successfully:", id);
            res.status(200).send(true); 
          });
        });
      }
    }
  });
});

// const createLead = asyncHandler((req, res) => {
//   let leadId = "L-" + generateRandomNumber(6);
//   let id = generateRandomNumber(9);
//   req.body["id"] = id;
//   req.body["leadId"] = leadId;
//   req.body["leadInternalStatus"] = 1;
//   req.body["lastLeadInternalStatus"] = 1;
//   const createClause = createClauseHandler(req.body);
//   const sql = `INSERT INTO leads (${createClause[0]}) VALUES (${createClause[1]})`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.error("createLead error in controller:", err);
//       res.status(500).send("Internal severerver error");
//       return; // Return to prevent further execution
//     }
//     const leaddocumentsSql = `INSERT INTO leaddocuments (leadId) VALUES ('${id}')`;
//     console.log("leaddocumentsSql:", leaddocumentsSql);
//     dbConnect.query(leaddocumentsSql, (leaddocumentsErr) => {
//       if (leaddocumentsErr) {
//         console.error(
//           "Error inserting leadId into leaddocuments table:",
//           leaddocumentsErr
//         );
//         res
//           .status(500)
//           .send(`Failed to insert leadId ${id} into leaddocuments table`);
//         return;
//       }
//       console.log("Lead ID inserted into leaddocuments successfully:", id);
//       res.status(200).send(true); // Send response after both insertions are complete
//     });
//   });
// });

// const createLead = asyncHandler((req, res) => {
//   let leadId = 'L-' + generateRandomNumber(6);
//   req.body['leadId'] = leadId;
//   req.body['leadInternalStatus'] = 1;
//   req.body['lastLeadInternalStatus'] = 1;

//   const createClause = createClauseHandler(req.body);
//   const sql = `INSERT INTO leads (${createClause[0]}) VALUES (${createClause[1]})`;

//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.error("Error creating lead:", err);
//       res.status(500).send("Internal Server Error");
//       return;
//     }
//     const id = result.insertId;
//     // Insert leadId into leaddocuments table
//     const leaddocumentsSql = `INSERT INTO leaddocuments (leadId) VALUES ('${id}')`;
//     dbConnect.query(leaddocumentsSql, (leaddocumentsErr, leaddocumentsResult) => {
//       if (leaddocumentsErr) {
//         console.error("Error inserting leadId into leaddocuments table:", leaddocumentsErr);
//         // Rollback lead insertion in leads table
//         const rollbackSql = `DELETE FROM leads WHERE leadId = '${id}'`;
//         dbConnect.query(rollbackSql, rollbackErr => {
//           if (rollbackErr) {
//             console.error("Error rolling back lead insertion in leads table:", rollbackErr);
//           }
//           res.status(500).send("Internal Server Error");
//         });
//         return;
//       }

//       res.status(200).send(true);
//     });
//   });
// });

// const createLead = asyncHandler((req, res) => {
//   let leadId = "L-" + generateRandomNumber(6);
//   req.body["leadId"] = leadId;
//   req.body["leadInternalStatus"] = 1;
//   req.body["lastLeadInternalStatus"] = 1;
//   const createClause = createClauseHandler(req.body);
//   const sql = `INSERT INTO leads (${createClause[0]}) VALUES (${createClause[1]})`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("Create lead  error:");
//     }
//     const id = result.insertId;
//     // Insert leadId into leaddocuments table
//     const leaddocumentsSql = `INSERT INTO leaddocuments (leadId) VALUES ('${id}')`;
//     dbConnect.query(
//       leaddocumentsSql,
//       (leaddocumentsErr, leaddocumentsResult) => {
//         if (leaddocumentsErr) {
//           console.error(
//             "Error inserting leadId into leaddocuments table:",
//             leaddocumentsErr
//           );
//           // Rollback lead insertion in leads table
//           const rollbackSql = `DELETE FROM leads WHERE id = '${id}'`;
//           dbConnect.query(rollbackSql, (rollbackErr) => {
//             if (rollbackErr) {
//               console.error(
//                 "Error rolling back lead insertion in leads table:",
//                 rollbackErr
//               );
//             }
//             res.status(500).send("Internal Server Error");
//           });
//           return;
//         }

//         res.status(200).send(true);
//       }
//     );
//     res.status(200).send(true);
//   });
// });

// const createLead = asyncHandler((req, res) => {
//   let leadId = "L-" + generateRandomNumber(6);
//   req.body["leadId"] = leadId;
//   req.body["leadInternalStatus"] = 1;
//   req.body["lastLeadInternalStatus"] = 1;
//   const createClause = createClauseHandler(req.body);
//   const sql = `INSERT INTO leads (${createClause[0]}) VALUES (${createClause[1]})`;

//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.error("Create lead error:", err);
//       return res.status(500).send("Internal severe Error");
//     }

//     const id = result.insertId;
//     console.log("Inserted lead ID:", id);

//     // Use LAST_INSERT_ID() to retrieve the last inserted ID
//     const leaddocumentsSql = `INSERT INTO leaddocuments (leadId) VALUES (LAST_INSERT_ID())`;
//     dbConnect.query(leaddocumentsSql, (leaddocumentsErr) => {
//       if (leaddocumentsErr) {
//         console.error("Error inserting leadId into leaddocuments table:", leaddocumentsErr);
//         return res.status(500).send(`Failed to insert leadId ${id} into leaddocuments table`);
//       }

//       // Both insertions succeeded, send response
//       res.status(200).send(true);
//     });
//   });
// });

// const createLead = asyncHandler((req, res) => {
//   let leadId = "L-" + generateRandomNumber(6);
//   req.body["leadId"] = leadId;
//   req.body["leadInternalStatus"] = 1;
//   req.body["lastLeadInternalStatus"] = 1;
//   const createClause = createClauseHandler(req.body);
//   const sql = `INSERT INTO leads (${createClause[0]}) VALUES (${createClause[1]})`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.error("Create lead error:", err);
//       res.status(500).send("Internal Server Error");
//       return;
//     }
//     // const id = result.insertId; // Obtain the insertId from the result object
//     // console.log("Inserted lead ID:", id);
//     // // Insert leadId into leaddocuments table
//     // const leaddocumentsSql = `INSERT INTO leaddocuments (leadId) VALUES (${id})`;
//     // console.log("leaddocumentsSql:", leaddocumentsSql); // Log the leaddocuments SQL query
//     // dbConnect.query(leaddocumentsSql, (leaddocumentsErr, leaddocumentsResult) => {
//     //   if (leaddocumentsErr) {
//     //     console.error("Error inserting leadId into leaddocuments table:", leaddocumentsErr);
//     //     res.status(500).send(`Failed to insert leadId ${id} into leaddocuments table`);
//     //     return;
//     //   } else {
//     //     console.log("Lead ID inserted into leaddocuments successfully:", id);
//     //     res.status(200).send(true);
//     //   }
//   // });
//     res.status(200).send(true);

//   });
// });

const updateLead = asyncHandler((req, res) => {
  const id = req.params.id;
  const checkRequiredFields = handleRequiredFields("leads", req.body);
  if (!checkRequiredFields) {
    res.status(422).send("Please Fill all required fields");
    return;
  }
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE leads SET ${updateClause} WHERE id = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("updateLead error in controller");
    }
    res.status(200).send(result);
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
    // const updateClause = updateClauseHandler(req.body);
    // const sql = `UPDATE leads SET ${updateClause} WHERE id = ${id}`;
    // dbConnect.query(sql, (err, result) => {
    //   if (err) {
    //     throw err;
    //   }
    //   res.status(404).send("No Lead Found");
    // });
  });
});

module.exports = {
  getLeads,
  getLeadSources,
  getLeadUsers,
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
};
