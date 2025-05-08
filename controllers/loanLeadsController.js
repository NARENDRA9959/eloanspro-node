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

const getTotalLeadsCountArray = asyncHandler(async (req, res) => {
    let sql = `
        SELECT 
            SUM(CASE WHEN loanType = 'personalLoan' THEN 1 ELSE 0 END) AS personalCount,
            SUM(CASE WHEN loanType = 'homeLoan' THEN 1 ELSE 0 END) AS homeLoanCount,
            SUM(CASE WHEN loanType = 'lap' THEN 1 ELSE 0 END) AS lapLoanCount
        FROM loanleads
    `;
    const queryParams = req.query;
    // queryParams["leadInternalStatus-eq"] = 1; // Applying the internal status filter
    const filtersQuery = handleGlobalFilters(queryParams, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getTotalLeadsCountArray error in controller", err);
            return res.status(500).send("Error in fetching Loan Leads Count");
        }
        const responseArray =
        {
            personalcount: result[0]["personalCount"] || 0,
            homeLoancount: result[0]["homeLoanCount"] || 0,
            LAPLoancount: result[0]["lapLoanCount"] || 0,
        }
        res.status(200).json(responseArray);
    });
});
const getStatusLeadsCountArray = asyncHandler(async (req, res) => {
    let sql = `
        SELECT 
            SUM(CASE WHEN loanType = 'homeLoan' AND employmentStatus = 'employed' THEN 1 ELSE 0 END) AS homeLoanCount,
            SUM(CASE WHEN loanType = 'homeLoan' AND employmentStatus = 'self-employed'  THEN 1 ELSE 0 END) AS homeLoanSelfCount,
            SUM(CASE WHEN loanType = 'lap' AND employmentStatus = 'employed' THEN 1 ELSE 0 END) AS lapLoanCount,
            SUM(CASE WHEN loanType = 'lap' AND employmentStatus = 'self-employed' THEN 1 ELSE 0 END) AS lapLoanSelfCount
        FROM loanleads
    `;
    const queryParams = req.query;
    // queryParams["leadInternalStatus-eq"] = 1; // Applying the internal status filter
    const filtersQuery = handleGlobalFilters(queryParams, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getStatusLeadsCountArray error in controller", err);
            return res.status(500).send("Error in fetching Loan Leads Employment Status Count");
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
            return res.status(500).send("Error In Deleting the Lead");
        }
        res.status(200).json({ message: "Lead Deleted Successfully" });
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

const createLoanLeadFromCallback = asyncHandler(async (req, res) => {
    const phoneNumber = req.body.primaryPhone;
    if (req.user.userType == 1) {
        return createNewLoanLeadFromCallback(req, res);
    }
    let checkPhoneQuery = `SELECT * FROM loanleads`;
    const queryParams = req.query;
    queryParams["primaryPhone-eq"] = phoneNumber;
    queryParams["loanType-eq"] = req.body.loanType;
    queryParams["employmentStatus-eq"] = req.body.employmentStatus;
    const filtersQuery = handleGlobalFilters(queryParams);
    checkPhoneQuery += filtersQuery;
    console.log(checkPhoneQuery)
    dbConnect.query(checkPhoneQuery, async (err, result) => {
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

function createNewLoanLeadFromCallback(req, res) {
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
            console.error("Error inserting data into leads table:", err);
            res.status(500).send("Internal server error");
            return;
        }
        console.log(leadId)
        res.status(200).json({ leadId: leadId });
    });
}
module.exports = {
    getloanLeads,
    getloanLeadsCount,
    getLoanLeadById,
    createLoanLead,
    updateLoanLead,
    deleteLoanLead,
    changeLoanLeadStatus,
    addLoanLeadsDocumentData,
    getTotalLeadsCountArray,
    getStatusLeadsCountArray,
    createLoanLeadFromCallback
};
