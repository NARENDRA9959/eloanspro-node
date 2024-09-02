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




const getloanLeadsCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as leadsCount FROM loanleads";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getloanLeadsCount error in controller");
        }
        const leadsCount = result[0]["leadsCount"];
        res.status(200).send(String(leadsCount));
    });
});

const getloanLeads = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM loanleads";
    const queryParams = req.query;
    queryParams["sort"] = "lastUpdatedOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getloanLeads Error in controller");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const getLoanLeadById = asyncHandler((req, res) => {
    const sql = `SELECT * FROM loanleads WHERE leadId = ${req.params.id}`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getLoanLeadById error in controller");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const createLoanLead = asyncHandler((req, res) => {
    const phoneNumber = req.body.primaryPhone;
    const checkPhoneQuery = `SELECT * FROM loanleads WHERE primaryPhone = ?`;
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
                let leadId = generateRandomNumber(9);
                req.body["leadId"] = leadId;
                req.body["leadInternalStatus"] = 1;
                req.body["lastLeadInternalStatus"] = 1;
                req.body["createdBy"] = req.user.name;
                const createClause = createClauseHandler(req.body);
                // console.log(createClause)
                // console.log(createClause[0])
                // console.log(createClause[1])
                const sql = `INSERT INTO loanleads (${createClause[0]}) VALUES (${createClause[1]})`;
                dbConnect.query(sql, (err, result) => {
                    if (err) {
                        console.log("createLoanLead error:");
                    }
                    res.status(200).send(true);
                });
            }
        }
    });
});



const updateLoanLead = asyncHandler((req, res) => {
    const id = req.params.id;
    const { primaryPhone } = req.body;
    const checkRequiredFields = handleRequiredFields("loanleads", req.body);
    if (!checkRequiredFields) {
        return res.status(422).send("Please fill all required fields");
    }
    const checkPhoneQuery = `SELECT * FROM loanleads WHERE primaryPhone = ? AND leadId != ?`;
    dbConnect.query(checkPhoneQuery, [primaryPhone, id], (err, result) => {
        if (err) {
            console.error("Error checking phone number:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (result.length > 0) {
            //console.log(result)
            const lead = result[0];
            return res
                .status(409)
                .send(
                    `Lead already exists with phone number ${primaryPhone}, created by - ${lead.createdBy}, Lead ID - ${lead.leadId}, Business Name - ${lead.businessName}`
                );
        }
        const updateClause = updateClauseHandler(req.body);
        const updateSql = `UPDATE loanleads SET ${updateClause} WHERE leadId = ?`;
        dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
            if (updateErr) {
                console.error("updateLoanLead error in controller:", updateErr);
                return res.status(500).send("Internal server error");
            }
            return res.status(200).send(updateResult);
        });
    });
});

const deleteLoanLead = asyncHandler((req, res) => {
    const sql = `DELETE FROM loanleads WHERE leadId = ${req.params.id}`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("deleteLoanLead error in controller");
        }
        res.status(200).send("Lead Deleted Successfully");
    });
});

const changeLoanLeadStatus = asyncHandler((req, res) => {
    const id = req.params.leadId;
    const statusId = req.params.statusId;
    const createSql = `SELECT * FROM loanleads WHERE leadId = ${id}`;
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
            const sql = `UPDATE loanleads SET ${updateClause} WHERE leadId = ${id}`;
            dbConnect.query(sql, (err, result) => {
                if (err) {
                    console.log("changeLoanLeadStatus error in controller");
                }
                res.status(200).send(true);
            });
        } else {
            res.status(422).send("No Leads Found");
        }
    });
});
module.exports = {
    getloanLeads,
    getloanLeadsCount,
    getLoanLeadById,
    createLoanLead,
    updateLoanLead,
    deleteLoanLead,
    changeLoanLeadStatus,
};
