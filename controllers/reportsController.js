
const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const moment = require('moment');
const ExcelJS = require('exceljs');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const { generateRandomNumber } = require("../middleware/valueGenerator");
const {
    createClauseHandler,
    updateClauseHandler,
} = require("../middleware/clauseHandler");
const { fetchFIPProcessDistinctLeadIds } = require('../controllers/loginsController');
const { fetchDistinctApprovedLeadIds } = require('../controllers/loginsController');
const { fetchDistinctDisbursedLeadIds } = require('../controllers/loginsController');
const { fetchDistinctBankRejectedLeadIds } = require('../controllers/loginsController');
const { fetchDistinctCNIRejectedLeadIds } = require('../controllers/loginsController');
const { getSourceName } = require('../controllers/teamController');


const cleanup = (directory, filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error("Error deleting the file:", unlinkErr);
            } else {
                console.log("File deleted successfully");
                if (fs.existsSync(directory)) {
                    fs.readdir(directory, (err, files) => {
                        if (err) {
                            console.error("Error reading directory:", err);
                        } else if (files.length === 0) {
                            fs.rmdir(directory, (rmdirErr) => {
                                if (rmdirErr) {
                                    console.error("Error deleting the directory:", rmdirErr);
                                } else {
                                    console.log("Directory deleted successfully");
                                }
                            });
                        }
                    });
                }
            }
        });
    }
};
const exportLeads = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM leads";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'leads1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);

    // const cleanup = (directory, filePath) => {
    //   fs.unlink(filePath, (unlinkErr) => {
    //     if (unlinkErr) {
    //       console.error("Error deleting the file:", unlinkErr);
    //     } else {
    //       console.log("File deleted successfully");
    //       fs.readdir(directory, (err, files) => {
    //         if (err) {
    //           console.error("Error reading directory:", err);
    //         } else if (files.length === 0) {
    //           fs.rmdir(directory, (rmdirErr) => {
    //             if (rmdirErr) {
    //               console.error("Error deleting the directory:", rmdirErr);
    //             } else {
    //               console.log("Directory deleted successfully");
    //             }
    //           });
    //         }
    //       });
    //     }
    //   });
    // };

    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting leads: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].sourcedBy = await getSourceName(result[i].sourcedBy);
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Leads');
            worksheet.columns = [
                { header: 'Lead Id', key: 'id' },
                { header: 'Business Name', key: 'businessName' },
                { header: 'Business Email', key: 'businessEmail' },
                { header: 'Contact Person', key: 'contactPerson' },
                { header: 'Primary Phone', key: 'primaryPhone' },
                { header: 'Secondary Phone', key: 'secondaryPhone' },
                { header: 'City', key: 'city' },
                { header: 'State', key: 'state' },
                { header: 'Business Entity', key: 'businessEntity' },
                { header: 'Business Turnover', key: 'businessTurnover' },
                { header: 'Nature Of Business', key: 'natureOfBusiness' },
                { header: 'Product', key: 'product' },
                { header: 'Business Vintage', key: 'businessOperatingSince' },
                { header: 'Had Own House', key: 'hadOwnHouse' },
                { header: 'Loan Requirement', key: 'loanRequirement' },
                { header: 'OD Requirement', key: 'odRequirement' },
                { header: 'Remarks', key: 'remarks' },
                { header: 'Sourced By', key: 'sourcedBy' },
                { header: 'Created By', key: 'createdBy' },
                { header: 'Created On', key: 'createdOn' },
            ];
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'LEADS';
            const leadId = 'REPORTS';
            const url = `https://files.thefintalk.in/files?type=${type}&leadId=${leadId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            // console.log('Response Status:', response.status);
            // console.log('Response Data:', response.data);
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl) VALUES (?, ?, ?)";
                    const values = [reportId, type, fileUrlArray];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            res.status(500).json({ error: "Internal server error" });
                            return;
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});



const exportCallbacks = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = "SELECT * FROM callbacks";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'callbacks1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    // const cleanup = (directory, filePath) => {
    //   fs.unlink(filePath, (unlinkErr) => {
    //     if (unlinkErr) {
    //       console.error("Error deleting the file:", unlinkErr);
    //     } else {
    //       console.log("File deleted successfully");
    //       fs.readdir(directory, (err, files) => {
    //         if (err) {
    //           console.error("Error reading directory:", err);
    //         } else if (files.length === 0) {
    //           fs.rmdir(directory, (rmdirErr) => {
    //             if (rmdirErr) {
    //               console.error("Error deleting the directory:", rmdirErr);
    //             } else {
    //               console.log("Directory deleted successfully");
    //             }
    //           });
    //         }
    //       });
    //     }
    //   });
    // };
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting leads: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            console.log(result)
            for (let i = 0; i < result.length; i++) {
                result[i].sourcedBy = await getSourceName(result[i].sourcedBy);
                result[i].createdOn = moment(new Date(result[i].createdOn)).format('YYYY-MM-DD');
                result[i].date = moment(new Date(result[i].date)).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Callbacks');
            worksheet.columns = [

                { header: 'CallBack Id', key: 'callBackId' },
                { header: 'Business Name', key: 'businessName' },
                { header: 'Phone', key: 'phone' },
                { header: 'Callback Date', key: 'date' },
                { header: 'Remarks', key: 'remarks' },
                { header: 'Sourced By', key: 'sourcedBy' },
                { header: 'Created On', key: 'createdOn' },
            ];
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'CALLBACKS';
            const leadId = 'REPORTS';
            const url = `https://files.thefintalk.in/files?type=${type}&leadId=${leadId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            // console.log('Response Status:', response.status);
            // console.log('Response Data:', response.data);
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl) VALUES (?, ?, ?)";
                    const values = [reportId, type, fileUrlArray];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            res.status(500).json({ error: "Internal server error" });
                            return;
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});
const exportFilesInProcess = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
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
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'FilesInProcess1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);


    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting leads: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            console.log("result", result);
            for (let i = 0; i < result.length; i++) {
                result[i].sourcedBy = await getSourceName(result[i].sourcedBy);
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('FilesInProcess');
            worksheet.columns = [
                { header: 'Lead Id', key: 'id' },
                { header: 'Business Name', key: 'businessName' },
                { header: 'Business Email', key: 'businessEmail' },
                { header: 'Contact Person', key: 'contactPerson' },
                { header: 'Primary Phone', key: 'primaryPhone' },
                { header: 'Secondary Phone', key: 'secondaryPhone' },
                { header: 'City', key: 'city' },
                { header: 'State', key: 'state' },
                { header: 'Business Entity', key: 'businessEntity' },
                { header: 'Business Turnover', key: 'businessTurnover' },
                { header: 'Nature Of Business', key: 'natureOfBusiness' },
                { header: 'Product', key: 'product' },
                { header: 'Business Vintage', key: 'businessOperatingSince' },
                { header: 'Had Own House', key: 'hadOwnHouse' },
                { header: 'Loan Requirement', key: 'loanRequirement' },
                { header: 'OD Requirement', key: 'odRequirement' },
                { header: 'Remarks', key: 'remarks' },
                { header: 'Sourced By', key: 'sourcedBy' },
                { header: 'Created By', key: 'createdBy' },
                { header: 'Created On', key: 'createdOn' },
            ];
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'FILESINPROCESS';
            const leadId = 'REPORTS';
            const url = `https://files.thefintalk.in/files?type=${type}&leadId=${leadId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl) VALUES (?, ?, ?)";
                    const values = [reportId, type, fileUrlArray];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            res.status(500).json({ error: "Internal server error" });
                            return;
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});




const exportApprovalLeads = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
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
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'ApprovalFiles1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);

    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting leads: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            for (let i = 0; i < result.length; i++) {
                result[i].sourcedBy = await getSourceName(result[i].sourcedBy);
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('ApprovalFiles');
            worksheet.columns = [
                { header: 'Lead Id', key: 'id' },
                { header: 'Business Name', key: 'businessName' },
                { header: 'Business Email', key: 'businessEmail' },
                { header: 'Contact Person', key: 'contactPerson' },
                { header: 'Primary Phone', key: 'primaryPhone' },
                { header: 'Secondary Phone', key: 'secondaryPhone' },
                { header: 'City', key: 'city' },
                { header: 'State', key: 'state' },
                { header: 'Business Entity', key: 'businessEntity' },
                { header: 'Business Turnover', key: 'businessTurnover' },
                { header: 'Nature Of Business', key: 'natureOfBusiness' },
                { header: 'Product', key: 'product' },
                { header: 'Business Vintage', key: 'businessOperatingSince' },
                { header: 'Had Own House', key: 'hadOwnHouse' },
                { header: 'Loan Requirement', key: 'loanRequirement' },
                { header: 'OD Requirement', key: 'odRequirement' },
                { header: 'Remarks', key: 'remarks' },
                { header: 'Sourced By', key: 'sourcedBy' },
                { header: 'Created By', key: 'createdBy' },
                { header: 'Created On', key: 'createdOn' },
            ];
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'SANCTIONFILES';
            const leadId = 'REPORTS';
            const url = `https://files.thefintalk.in/files?type=${type}&leadId=${leadId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl) VALUES (?, ?, ?)";
                    const values = [reportId, type, fileUrlArray];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            res.status(500).json({ error: "Internal server error" });
                            return;
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});



const exportDisbursalLeads = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
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
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'DisbursalFiles1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);

    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting leads: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            for (let i = 0; i < result.length; i++) {
                result[i].sourcedBy = await getSourceName(result[i].sourcedBy);
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('DisbursalFiles');
            worksheet.columns = [
                { header: 'Lead Id', key: 'id' },
                { header: 'Business Name', key: 'businessName' },
                { header: 'Business Email', key: 'businessEmail' },
                { header: 'Contact Person', key: 'contactPerson' },
                { header: 'Primary Phone', key: 'primaryPhone' },
                { header: 'Secondary Phone', key: 'secondaryPhone' },
                { header: 'City', key: 'city' },
                { header: 'State', key: 'state' },
                { header: 'Business Entity', key: 'businessEntity' },
                { header: 'Business Turnover', key: 'businessTurnover' },
                { header: 'Nature Of Business', key: 'natureOfBusiness' },
                { header: 'Product', key: 'product' },
                { header: 'Business Vintage', key: 'businessOperatingSince' },
                { header: 'Had Own House', key: 'hadOwnHouse' },
                { header: 'Loan Requirement', key: 'loanRequirement' },
                { header: 'OD Requirement', key: 'odRequirement' },
                { header: 'Remarks', key: 'remarks' },
                { header: 'Sourced By', key: 'sourcedBy' },
                { header: 'Created By', key: 'createdBy' },
                { header: 'Created On', key: 'createdOn' },
            ];
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'DISBURSALFILES';
            const leadId = 'REPORTS';
            const url = `https://files.thefintalk.in/files?type=${type}&leadId=${leadId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl) VALUES (?, ?, ?)";
                    const values = [reportId, type, fileUrlArray];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            res.status(500).json({ error: "Internal server error" });
                            return;
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});


const exportBankRejectedLeads = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
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
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'BankRejectedFiles1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);

    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting leads: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            for (let i = 0; i < result.length; i++) {
                result[i].sourcedBy = await getSourceName(result[i].sourcedBy);
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('BankRejectedFiles');
            worksheet.columns = [
                { header: 'Lead Id', key: 'id' },
                { header: 'Business Name', key: 'businessName' },
                { header: 'Business Email', key: 'businessEmail' },
                { header: 'Contact Person', key: 'contactPerson' },
                { header: 'Primary Phone', key: 'primaryPhone' },
                { header: 'Secondary Phone', key: 'secondaryPhone' },
                { header: 'City', key: 'city' },
                { header: 'State', key: 'state' },
                { header: 'Business Entity', key: 'businessEntity' },
                { header: 'Business Turnover', key: 'businessTurnover' },
                { header: 'Nature Of Business', key: 'natureOfBusiness' },
                { header: 'Product', key: 'product' },
                { header: 'Business Vintage', key: 'businessOperatingSince' },
                { header: 'Had Own House', key: 'hadOwnHouse' },
                { header: 'Loan Requirement', key: 'loanRequirement' },
                { header: 'OD Requirement', key: 'odRequirement' },
                { header: 'Remarks', key: 'remarks' },
                { header: 'Sourced By', key: 'sourcedBy' },
                { header: 'Created By', key: 'createdBy' },
                { header: 'Created On', key: 'createdOn' },
            ];
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'BANKREJECTEDFILES';
            const leadId = 'REPORTS';
            const url = `https://files.thefintalk.in/files?type=${type}&leadId=${leadId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl) VALUES (?, ?, ?)";
                    const values = [reportId, type, fileUrlArray];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            res.status(500).json({ error: "Internal server error" });
                            return;
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});
const exportCNILeads = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
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
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'CNIFiles1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);

    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting leads: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            console.log(result);
            for (let i = 0; i < result.length; i++) {
                result[i].sourcedBy = await getSourceName(result[i].sourcedBy);
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('CNIFiles');
            worksheet.columns = [
                { header: 'Lead Id', key: 'id' },
                { header: 'Business Name', key: 'businessName' },
                { header: 'Business Email', key: 'businessEmail' },
                { header: 'Contact Person', key: 'contactPerson' },
                { header: 'Primary Phone', key: 'primaryPhone' },
                { header: 'Secondary Phone', key: 'secondaryPhone' },
                { header: 'City', key: 'city' },
                { header: 'State', key: 'state' },
                { header: 'Business Entity', key: 'businessEntity' },
                { header: 'Business Turnover', key: 'businessTurnover' },
                { header: 'Nature Of Business', key: 'natureOfBusiness' },
                { header: 'Product', key: 'product' },
                { header: 'Business Vintage', key: 'businessOperatingSince' },
                { header: 'Had Own House', key: 'hadOwnHouse' },
                { header: 'Loan Requirement', key: 'loanRequirement' },
                { header: 'OD Requirement', key: 'odRequirement' },
                { header: 'Remarks', key: 'remarks' },
                { header: 'Sourced By', key: 'sourcedBy' },
                { header: 'Created By', key: 'createdBy' },
                { header: 'Created On', key: 'createdOn' },
            ];
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'CNIFILES';
            const leadId = 'REPORTS';
            const url = `https://files.thefintalk.in/files?type=${type}&leadId=${leadId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl) VALUES (?, ?, ?)";
                    const values = [reportId, type, fileUrlArray];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            res.status(500).json({ error: "Internal server error" });
                            return;
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});

const exportSanctionDetails = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    const queryParams = req.query;
    queryParams["fipStatus-eq"] = 'approved';
    const filtersQuery = handleGlobalFilters(queryParams);
    let sql2 = `AND sub.leadId = main.leadId`
    let sql = `SELECT DISTINCT leadId, businessName, 
    (
      SELECT SUM(sanctionedAmount)
      FROM logins AS sub
           ${filtersQuery}
          ${sql2}
        ) AS totalSanctionedAmount
  FROM logins AS main
  `;
    sql += filtersQuery;
    console.log(sql)
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'sanctionDetails1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    // const cleanup = (directory, filePath) => {
    //     fs.unlink(filePath, (unlinkErr) => {
    //         if (unlinkErr) {
    //             console.error("Error deleting the file:", unlinkErr);
    //         } else {
    //             console.log("File deleted successfully");
    //             fs.readdir(directory, (err, files) => {
    //                 if (err) {
    //                     console.error("Error reading directory:", err);
    //                 } else if (files.length === 0) {
    //                     fs.rmdir(directory, (rmdirErr) => {
    //                         if (rmdirErr) {
    //                             console.error("Error deleting the directory:", rmdirErr);
    //                         } else {
    //                             console.log("Directory deleted successfully");
    //                         }
    //                     });
    //                 }
    //             });
    //         }
    //     });
    // };


    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting leads: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('sanctionDetails');
            worksheet.columns = [
                { header: 'Lead Id', key: 'leadId' },
                { header: 'Business Name', key: 'businessName' },
                { header: 'Sanctioned Amount', key: 'totalSanctionedAmount' },
            ];
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'SANCTIONDETAILS';
            const leadId = 'REPORTS';
            const url = `https://files.thefintalk.in/files?type=${type}&leadId=${leadId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl) VALUES (?, ?, ?)";
                    const values = [reportId, type, fileUrlArray];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            res.status(500).json({ error: "Internal server error" });
                            return;
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});


const exportDisbursalDetails = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    const queryParams = req.query;
    queryParams["approvedStatus-eq"] = 'disbursed';
    queryParams["fipStatus-eq"] = 'approved';
    const filtersQuery = handleGlobalFilters(queryParams);
    let sql2 = `AND sub.leadId = main.leadId`
    let sql = `SELECT DISTINCT leadId, businessName, 
        (
          SELECT SUM(disbursedAmount)
          FROM logins AS sub
           ${filtersQuery}
          ${sql2}
        ) AS totalDisbursedAmount
      FROM logins AS main
  `;
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'disbursalDetails1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    // const cleanup = (directory, filePath) => {
    //     fs.unlink(filePath, (unlinkErr) => {
    //         if (unlinkErr) {
    //             console.error("Error deleting the file:", unlinkErr);
    //         } else {
    //             console.log("File deleted successfully");
    //             fs.readdir(directory, (err, files) => {
    //                 if (err) {
    //                     console.error("Error reading directory:", err);
    //                 } else if (files.length === 0) {
    //                     fs.rmdir(directory, (rmdirErr) => {
    //                         if (rmdirErr) {
    //                             console.error("Error deleting the directory:", rmdirErr);
    //                         } else {
    //                             console.log("Directory deleted successfully");
    //                         }
    //                     });
    //                 }
    //             });
    //         }
    //     });
    // };


    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting leads: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('disbursalDetails');
            worksheet.columns = [
                { header: 'Lead Id', key: 'leadId' },
                { header: 'Business Name', key: 'businessName' },
                { header: 'Disbursed Amount', key: 'totalDisbursedAmount' },
            ];
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'DISBURSALDETAILS';
            const leadId = 'REPORTS';
            const url = `https://files.thefintalk.in/files?type=${type}&leadId=${leadId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl) VALUES (?, ?, ?)";
                    const values = [reportId, type, fileUrlArray];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            res.status(500).json({ error: "Internal server error" });
                            return;
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});

const exportloginsDoneDetails = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    let sql = `SELECT leadId, businessName, program, bankName, fipStatus, fipRemarks FROM logins
  `;
    const queryParams = req.query;
    queryParams["sort"] = "leadId";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'loginsDoneDetails1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    // const cleanup = (directory, filePath) => {
    //     fs.unlink(filePath, (unlinkErr) => {
    //         if (unlinkErr) {
    //             console.error("Error deleting the file:", unlinkErr);
    //         } else {
    //             console.log("File deleted successfully");
    //             fs.readdir(directory, (err, files) => {
    //                 if (err) {
    //                     console.error("Error reading directory:", err);
    //                 } else if (files.length === 0) {
    //                     fs.rmdir(directory, (rmdirErr) => {
    //                         if (rmdirErr) {
    //                             console.error("Error deleting the directory:", rmdirErr);
    //                         } else {
    //                             console.log("Directory deleted successfully");
    //                         }
    //                     });
    //                 }
    //             });
    //         }
    //     });
    // };


    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting leads: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            for (let i = 0; i < result.length; i++) {
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('loginsDoneDetails');
            worksheet.columns = [
                { header: 'Lead Id', key: 'leadId' },
                { header: 'Business Name', key: 'businessName' },
                { header: 'Bank Name', key: 'bankName' },
                { header: 'Program', key: 'program' },
                { header: 'Status', key: 'fipStatus' },
                { header: 'Remarks', key: 'fipRemarks' },
            ];
            worksheet.addRows(result);
            await workbook.xlsx.writeFile(excelFilePath);
            console.log("Excel file created successfully at", excelFilePath);
            const fileContent = fs.readFileSync(excelFilePath);
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('files', fileContent, {
                filename: excelFileName,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const type = 'LOGINSDONEDETAILS';
            const leadId = 'REPORTS';
            const url = `https://files.thefintalk.in/files?type=${type}&leadId=${leadId}`;
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl) VALUES (?, ?, ?)";
                    const values = [reportId, type, fileUrlArray];
                    dbConnect.query(insertSql, values, (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Error inserting report URL into the database:", insertErr);
                            res.status(500).json({ error: "Internal server error" });
                            return;
                        }
                        console.log("Report URL inserted successfully into the database");
                        res.status(200).json({
                            success: true,
                            message: 'File uploaded successfully',
                            fileUrl: fileUrl,
                        });
                    });
                } else {
                    console.warn("Server returned 200 status but no file URL in response.");
                    res.status(500).json({ error: "Upload succeeded but no file URL returned" });
                }
            } else {
                console.error("Error uploading file:", response.data);
                res.status(500).json({ error: "Error uploading file" });
            }
        } catch (error) {
            console.error("Error processing leads:", error);
            res.status(500).json({ error: "Internal server error" });
        } finally {
            cleanup(uploadDirectory, excelFilePath);
        }
    });
});


const getReports = asyncHandler(async (req, res) => {
    let sql = "SELECT * FROM reports";
    const queryParams = req.query;
    queryParams["sort"] = "createdOn";
    const filtersQuery = handleGlobalFilters(queryParams);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("getReports Error in controller");
        }
        let reportsData = parseNestedJSON(result);
        res.status(200).send(reportsData);
    });
});
const getReportsCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as reportCount FROM reports";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.log("Error in getUsersCount:", err);
            res.status(500).send("Internal Server Error");
        } else {
            const reportsCount = result[0]["reportCount"];
            res.status(200).send(String(reportsCount));
        }
    });
});
module.exports = {
    exportFilesInProcess,
    exportApprovalLeads,
    exportDisbursalLeads,
    exportBankRejectedLeads,
    exportCNILeads,
    exportSanctionDetails,
    exportloginsDoneDetails,
    exportDisbursalDetails,
    exportLeads,
    exportCallbacks,
    getReports,
    getReportsCount,
};