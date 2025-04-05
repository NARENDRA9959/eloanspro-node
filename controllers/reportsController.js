
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
const { fetchFIPProcessDistinctLeadIds } = require('../controllers/loginsController');
const { fetchDistinctApprovedLeadIds } = require('../controllers/loginsController');
const { fetchDistinctDisbursedLeadIds } = require('../controllers/loginsController');
const { fetchDistinctBankRejectedLeadIds } = require('../controllers/loginsController');
const { fetchDistinctCNIRejectedLeadIds } = require('../controllers/loginsController');
const { getSourceName } = require('../controllers/teamController');
const {
    projectConstantsLocal
} = require("../constants/project-constants");



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
                result[i].lastUpdatedOn = moment(result[i].lastUpdatedOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Leads');
            worksheet.columns = projectConstantsLocal.LEAD_WORKSHEET_COLUMNS;
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
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const createdBy = req.user.name;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
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
                result[i].lastUpdatedOn = moment(new Date(result[i].lastUpdatedOn)).format('YYYY-MM-DD');
                result[i].date = moment(new Date(result[i].date)).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Callbacks');
            worksheet.columns = projectConstantsLocal.CALLBACKS_WORKSHEET_COLUMNS;
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
            if (response.status === 200) {
                if (response.data && response.data.links && response.data.links.length > 0) {
                    const fileUrl = response.data.links[0];
                    const fileUrlArray = JSON.stringify([fileUrl]);
                    const createdBy = req.user.name;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
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
            worksheet.columns = projectConstantsLocal.LEAD_WORKSHEET_COLUMNS;
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
                    const createdBy = req.user.name;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
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
            worksheet.columns = projectConstantsLocal.LEAD_WORKSHEET_COLUMNS;
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
                    const createdBy = req.user.name;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
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
            worksheet.columns = projectConstantsLocal.LEAD_WORKSHEET_COLUMNS;
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
                    const createdBy = req.user.name;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
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
            worksheet.columns = projectConstantsLocal.LEAD_WORKSHEET_COLUMNS;
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
                    const createdBy = req.user.name;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
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
            worksheet.columns = projectConstantsLocal.LEAD_WORKSHEET_COLUMNS;
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
                    const createdBy = req.user.name;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
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
            worksheet.columns = projectConstantsLocal.SANCTIONED_DETAILS_COLUMNS;
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
                    const createdBy = req.user.name;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
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
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting leads: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            // for (let i = 0; i < result.length; i++) {
            //     result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
            // }
            for (let i = 0; i < result.length; i++) {
                let leadId = result[i].leadId;
                let contactSql = `SELECT primaryPhone FROM leads WHERE id = ?`;
    
                const contactResult = await new Promise((resolve, reject) => {
                    dbConnect.query(contactSql, [leadId], (contactErr, contactRes) => {
                        if (contactErr) reject(contactErr);
                        else resolve(contactRes);
                    });
                });
    
                // Assign contact number to the result object
                result[i].primaryPhone = contactResult.length > 0 ? contactResult[0].primaryPhone : 'N/A';
    
                // Format date if needed
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('disbursalDetails');
            worksheet.columns = projectConstantsLocal.DISBURSED_DETAILS_COLUMNS;
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
                    const createdBy = req.user.name;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
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
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting leads: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        try {
            for (let i = 0; i < result.length; i++) {
                let leadId = result[i].leadId;
                let contactSql = `SELECT primaryPhone FROM leads WHERE id = ?`;
                const contactResult = await new Promise((resolve, reject) => {
                    dbConnect.query(contactSql, [leadId], (contactErr, contactRes) => {
                        if (contactErr) reject(contactErr);
                        else resolve(contactRes);
                    });
                });
                // Assign contact number to the result object
                result[i].primaryPhone = contactResult.length > 0 ? contactResult[0].primaryPhone : 'N/A';
                result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
                result[i].loginDate = moment(result[i].loginDate).format('YYYY-MM-DD');
                result[i].fipStatus = result[i].fipStatus.charAt(0).toUpperCase() + result[i].fipStatus.slice(1).toLowerCase();
            }
            result = parseNestedJSON(result);
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('loginsDoneDetails');
            worksheet.columns = projectConstantsLocal.LOGIN_DETAILS_COLUMNS;
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
                    const createdBy = req.user.name;
                    const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                    const values = [reportId, type, fileUrlArray, createdBy];
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

const exportCNILeadDetails = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    const distinctLeadIds = await fetchDistinctCNIRejectedLeadIds();
    if (distinctLeadIds.length === 0) {
        return res.status(200).json([]);
    }
    const inClause = distinctLeadIds.map((id) => `${id}`).join(",");
    let sqlLogins = `SELECT * FROM logins WHERE (leadId IN (${inClause})) AND (fipStatus = 'approved' AND approvedStatus IN ('cnis', 'hold')) OR fipStatus ='hold'`;
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'CNIDetails1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sqlLogins, async (err, loginsResult) => {
        if (err) {
            console.error("Error exporting leads from logins: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        let sqlLeads = `SELECT id, contactPerson, primaryPhone, city, sourcedBy, businessEntity, 
                businessTurnover, natureOfBusiness, product, businessOperatingSince, createdOn
                FROM leads `;
        const queryParams = req.query || {};
        queryParams["id-or"] = inClause;
        queryParams["sort"] = "createdOn";
        const filtersQuery = handleGlobalFilters(queryParams);
        sqlLeads += filtersQuery;
        dbConnect.query(sqlLeads, async (leadsErr, leadsResult) => {
            if (leadsErr) {
                console.error("Error exporting leads from leads table: ", leadsErr);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            try {
                const mergedResults = loginsResult.map((login) => {
                    const matchingLead = leadsResult.find((lead) => lead.id == login.leadId);
                    return {
                        ...login,
                        businessEntity: matchingLead ? matchingLead.businessEntity : null,
                        businessTurnover: matchingLead ? matchingLead.businessTurnover : null,
                        natureOfBusiness: matchingLead ? matchingLead.natureOfBusiness : null,
                        product: matchingLead ? matchingLead.product : null,
                        contactPerson: matchingLead ? matchingLead.contactPerson : null,
                        primaryPhone: matchingLead ? matchingLead.primaryPhone : null,
                        city: matchingLead ? matchingLead.city : null,
                        sourcedBy: matchingLead ? matchingLead.sourcedBy : null,
                        createdOn: matchingLead ? matchingLead.createdOn : null,
                    };
                });
                for (let i = 0; i < mergedResults.length; i++) {
                    mergedResults[i].sourcedBy = await getSourceName(mergedResults[i].sourcedBy);
                    mergedResults[i].createdOn = moment(mergedResults[i].createdOn).format('YYYY-MM-DD');
                    // mergedResults[i].approvedStatus = mergedResults[i].approvedStatus.toUpperCase();
                    // mergedResults[i].fipStatus = mergedResults[i].fipStatus.toUpperCase();
                    mergedResults[i].approvedStatus = mergedResults[i].approvedStatus.charAt(0).toUpperCase() + mergedResults[i].approvedStatus.slice(1).toLowerCase();
                    mergedResults[i].fipStatus = mergedResults[i].fipStatus.charAt(0).toUpperCase() + mergedResults[i].fipStatus.slice(1).toLowerCase();
                }
                const parsedResults = parseNestedJSON(mergedResults);
                if (!fs.existsSync(uploadDirectory)) {
                    fs.mkdirSync(uploadDirectory, { recursive: true });
                }
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('CNIDetails');
                worksheet.columns = projectConstantsLocal.CNI_DETAILS_COLUMNS;
                worksheet.addRows(parsedResults);
                await workbook.xlsx.writeFile(excelFilePath);
                console.log("Excel file created successfully at", excelFilePath);
                const fileContent = fs.readFileSync(excelFilePath);
                const FormData = require('form-data');
                const formData = new FormData();
                formData.append('files', fileContent, {
                    filename: excelFileName,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                const type = 'CNIDETAILS';
                const leadId = 'REPORTS';
                const url = `https://files.thefintalk.in/files?type=${type}&leadId=${leadId}`;
                const response = await axios.post(url, formData, {
                    headers: formData.getHeaders(),
                });
                if (response.status === 200) {
                    if (response.data && response.data.links && response.data.links.length > 0) {
                        const fileUrl = response.data.links[0];
                        const fileUrlArray = JSON.stringify([fileUrl]);
                        const createdBy = req.user.name;
                        const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                        const values = [reportId, type, fileUrlArray, createdBy];
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

const exportloginFiles = asyncHandler(async (req, res) => {
    let reportId = "R-" + generateRandomNumber(6);
    const queryParams = req.query;
    const sourcedByFilter = queryParams["sourcedBy-eq"] || queryParams["sourcedBy-or"];
    let leadIds = [];
    if (sourcedByFilter) {
        // const leadsSql = `SELECT id FROM leads WHERE sourcedBy = ${dbConnect.escape(sourcedByFilter)}`;
        const sourcedByArray = sourcedByFilter.split(',').map(Number).join(',');
        const leadsSql = `SELECT id FROM leads WHERE sourcedBy IN (${sourcedByArray})`;
        console.log(leadsSql);
        const [leadsErr, leadsResult] = await new Promise((resolve) => {
            dbConnect.query(leadsSql, (err, result) => resolve([err, result]));
        });
        if (leadsErr) {
            console.error("Error fetching leads:", leadsErr);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        leadIds = leadsResult.map((lead) => lead.id);
        if (leadIds.length === 0) {
            res.status(200).send(
                "No leads found for the given filter");
            return;
        }
    }
    const filteredQueryParams = { ...queryParams };
    delete filteredQueryParams["sourcedBy-eq"];
    delete filteredQueryParams["sourcedBy-or"];
    let sql = `SELECT * FROM logins`;
    const filtersQuery = handleGlobalFilters(filteredQueryParams);
    sql += filtersQuery;
    if (leadIds.length > 0) {
        if (!filtersQuery.includes('WHERE')) {
            sql += ' WHERE';
        } else {
            sql += ' AND';
        }
        sql += ` leadId IN (${leadIds.map((id) => dbConnect.escape(id)).join(',')})`;
    }
    sql += ` ORDER BY leadId DESC`;
    console.log("Final SQL Query:", sql);
    const uploadDirectory = path.join(__dirname, '../excelFiles');
    const excelFileName = 'loginFiles1.xlsx';
    const excelFilePath = path.join(uploadDirectory, excelFileName);
    dbConnect.query(sql, async (err, result) => {
        if (err) {
            console.error("Error exporting leads:", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        const leadIds = result.map((login) => login.leadId);
        const leadsSql = `SELECT id, sourcedBy FROM leads WHERE id IN (${leadIds.map((id) => dbConnect.escape(id)).join(',')})`;
        dbConnect.query(leadsSql, async (leadsErr, leadsResult) => {
            if (leadsErr) {
                console.error("Error fetching sourcedBy values:", leadsErr);
                res.status(500).json({ error: "Internal server error" });
                return;
            }
            const sourcedByMap = {};
            leadsResult.forEach((lead) => {
                sourcedByMap[lead.id] = lead.sourcedBy;
            });
            for (let i = 0; i < result.length; i++) {
                const login = result[i];
                const sourcedById = sourcedByMap[login.leadId];
                login.sourcedBy = await getSourceName(sourcedById); // Add sourcedBy name
            }
            try {
                console.log(result)
                for (let i = 0; i < result.length; i++) {
                    let leadId = result[i].leadId;
                    let contactSql = `SELECT primaryPhone FROM leads WHERE id = ?`;
                    const contactResult = await new Promise((resolve, reject) => {
                        dbConnect.query(contactSql, [leadId], (contactErr, contactRes) => {
                            if (contactErr) reject(contactErr);
                            else resolve(contactRes);
                        });
                    });
                    // Assign contact number to the result object
                    result[i].primaryPhone = contactResult.length > 0 ? contactResult[0].primaryPhone : 'N/A';
                    result[i].approvalDate = result[i].approvalDate
                        ? moment(result[i].approvalDate).format('YYYY-MM-DD')
                        : result[i].approvalDate;
                    result[i].disbursalDate = result[i].disbursalDate
                        ? moment(result[i].disbursalDate).format('YYYY-MM-DD')
                        : result[i].disbursalDate;
                    result[i].loginDate = result[i].loginDate
                        ? moment(result[i].loginDate).format('YYYY-MM-DD')
                        : result[i].loginDate;
                    result[i].createdOn = result[i].createdOn
                        ? moment(result[i].createdOn).format('YYYY-MM-DD')
                        : result[i].createdOn;
                    result[i].lastUpdatedOn = result[i].lastUpdatedOn
                        ? moment(result[i].lastUpdatedOn).format('YYYY-MM-DD')
                        : result[i].lastUpdatedOn;
                    result[i].approvedStatus = result[i].approvedStatus.charAt(0).toUpperCase() + result[i].approvedStatus.slice(1).toLowerCase();
                    result[i].fipStatus = result[i].fipStatus.charAt(0).toUpperCase() + result[i].fipStatus.slice(1).toLowerCase();
                }
                result = parseNestedJSON(result);
                if (!fs.existsSync(uploadDirectory)) {
                    fs.mkdirSync(uploadDirectory, { recursive: true });
                }
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('loginFiles');
                worksheet.columns = projectConstantsLocal.LOGIN_FILES_COLUMNS;
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
                const type = 'LOGINFILES';
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
                        console.log(req.user)
                        const createdBy = req.user.name;
                        const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl, createdBy) VALUES (?, ?, ?,?)";
                        const values = [reportId, type, fileUrlArray, createdBy];
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
    exportCNILeadDetails,
    exportloginFiles
};