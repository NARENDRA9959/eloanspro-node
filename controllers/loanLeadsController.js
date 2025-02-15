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
            return res.status(500).send("Error in fetching the Loan Leads Count");
        }
        const leadsCount = result[0]["leadsCount"];
        res.status(200).send(String(leadsCount));
    });
});

const getloanLeads = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM loanleads";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getloanLeads Error in controller");
            return res.status(500).send("Error in fetching the Loan Leads");
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
            return res.status(500).send("Error in fetching the Loan Lead Details");
        }
        result = parseNestedJSON(result);
        res.status(200).send(result);
    });
});

const createLoanLead = asyncHandler((req, res) => {
    const phoneNumber = req.body.primaryPhone;
    console.log(req.body)
    let checkPhoneQuery = `SELECT * FROM loanleads`;
    const queryParams = req.query;
    queryParams["primaryPhone-eq"] = phoneNumber;
    queryParams["loanType-eq"] = req.body.loanType;
    queryParams["employmentStatus-eq"] = req.body.employmentStatus;
    const filtersQuery = handleGlobalFilters(queryParams);
    checkPhoneQuery += filtersQuery;
    console.log(checkPhoneQuery)
    dbConnect.query(checkPhoneQuery, (err, result) => {
        if (err) {
            console.error("Error checking phone number:", err);
            return res.status(500).send("Error in checking phone number");
        } else {
            if (result.length > 0) {
                const lead = result[0];
                res
                    .status(500)
                    .send(
                        `Lead already exists with phone number ${phoneNumber}, created by ${lead.sourcedByName}, Lead ID - ${lead.leadId}`
                    );
            } else {
                let leadId = generateRandomNumber(5);
                req.body["leadId"] = leadId;
                req.body["leadInternalStatus"] = 1;
                req.body["lastLeadInternalStatus"] = 1;
                req.body["createdBy"] = req.user.name;
                req.body["lastUpdatedBy"] = req.user.name;
                const createClause = createClauseHandler(req.body);
                const sql = `INSERT INTO loanleads (${createClause[0]}) VALUES (${createClause[1]})`;
                dbConnect.query(sql, (err, result) => {
                    if (err) {
                        console.log("createLoanLead error:");
                        return res.status(500).send("Error in creating the Loan Lead");
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
    let checkPhoneQuery = `SELECT * FROM loanleads`;
    const queryParams = req.query;
    queryParams["primaryPhone-eq"] = primaryPhone;
    queryParams["loanType-eq"] = req.body.loanType;
    queryParams["employmentStatus-eq"] = req.body.employmentStatus;
    const filtersQuery = handleGlobalFilters(queryParams);
    checkPhoneQuery += filtersQuery;
    let sql = ` AND leadId != ${id}`
    checkPhoneQuery += sql;
    console.log(checkPhoneQuery)
    dbConnect.query(checkPhoneQuery, [primaryPhone, id], (err, result) => {
        if (err) {
            console.error("Error checking phone number:", err);
            return res.status(500).send("Error in Checking the Phone Number");
        }
        if (result.length > 0) {
            const lead = result[0];
            return res
                .status(409)
                .send(
                    `Lead already exists with phone number ${primaryPhone}, created by - ${lead.sourcedByName}, Lead ID - ${lead.leadId}`
                );
        }
        req.body["lastUpdatedBy"] = req.user.name;
        const updateClause = updateClauseHandler(req.body);
        const updateSql = `UPDATE loanleads SET ${updateClause} WHERE leadId = ?`;
        dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
            if (updateErr) {
                console.error("updateLoanLead error in controller:", updateErr);
                return res.status(500).send("Error in updating the Loan Lead");
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
            return res.status(500).send("Error in Finding the Lead Id");
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
                    return res.status(500).send("Error in updating the Loan Lead Status");
                }
                res.status(200).send(true);
            });
        } else {
            res.status(422).send("No Leads Found");
        }
    });
});

const addLoanLeadsDocumentData = asyncHandler((req, res) => {
    const id = req.params.leadId;
    const updateClause = updateClauseHandler(req.body);
    const sql = `UPDATE loanleads SET ${updateClause} WHERE leadId = ${id}`;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("addLoanLeadsDocumentData error in controller");
            return res.status(500).send("Error in updating the Loan Leads Document  Details");
        }
        res.status(200).send({ success: "Documents Saved Successfully" });
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
    addLoanLeadsDocumentData
};
