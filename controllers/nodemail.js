const cron = require('node-cron');
const nodemailer = require('nodemailer');
const moment = require('moment');
const dbConnect = require("../config/dbConnection");
const { getSourceName } = require('../controllers/teamController');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function getActiveSourcedByIds() {
    const sql = `SELECT id FROM users WHERE userType = 3 AND status = "Active"`;
    return new Promise((resolve, reject) => {
        dbConnect.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            const activeSourcedByIds = result.map(row => row.id);
            resolve(activeSourcedByIds);
        });
    });
}

async function getJoiningDate(userId) {
    try {
        const sql = `SELECT joiningDate FROM users WHERE id = ?`;

        const result = await new Promise((resolve, reject) => {
            dbConnect.query(sql, [userId], (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });

        if (result.length === 0) return 'N/A';
        // Format the joining date to 'MMM DD, YYYY' (e.g., Aug 20, 2024)
        return moment(result[0].joiningDate).format('MMM DD, YYYY');
    } catch (error) {
        console.error('Error fetching joining date:', error);
        return 'N/A';
    }
}

async function getLeadsAndCallbacksCountForActiveSources() {
    try {
        // Step 1: Get the active sourcedBy IDs from sources table
        const activeSourcedByIds = await getActiveSourcedByIds();
        if (activeSourcedByIds.length === 0) {
            console.log("No active sourcedBy IDs found.");
            return;
        }
        const today = moment().startOf('day').format('YYYY-MM-DD');
        const tomorrow = moment().add(1, 'days').startOf('day').format('YYYY-MM-DD');
        const firstDayOfMonth = moment().startOf('month').format('YYYY-MM-DD');
        const nextMonth = moment().add(1, 'month').startOf('month').format('YYYY-MM-DD');
        // Step 2: Get the count of leads for active sourcedBy IDs
        const sqlLeads = `
            SELECT sourcedBy, COUNT(*) AS count
            FROM leads
            WHERE createdOn >= ? 
              AND createdOn < ? 
              AND sourcedBy IN (?) 
              AND leadInternalStatus = 1
            GROUP BY sourcedBy
        `;

        const sqlCallbacks = `
            SELECT sourcedBy, COUNT(*) AS count
            FROM callbacks
            WHERE createdOn >= ? 
              AND createdOn < ? 
              AND sourcedBy IN (?) 
              AND callbackInternalStatus = 1
            GROUP BY sourcedBy
        `;
        const sqlLoanLeads = `
            SELECT sourcedBy, COUNT(*) AS count
            FROM loanleads
            WHERE createdOn >= ? 
                AND createdOn < ? 
                AND sourcedBy IN (?) 
                AND leadInternalStatus = 1
            GROUP BY sourcedBy
    `;
        const sqlLeadsThisMonth = `
            SELECT sourcedBy, COUNT(*) AS count
            FROM leads
            WHERE createdOn >= ? AND createdOn < ? AND sourcedBy IN (?) AND leadInternalStatus = 1
            GROUP BY sourcedBy
`;
        const sqlCallbacksThisMonth = `
            SELECT sourcedBy, COUNT(*) AS count
            FROM callbacks
            WHERE createdOn >= ? AND createdOn < ? AND sourcedBy IN (?) AND callbackInternalStatus = 1
            GROUP BY sourcedBy
`;
        const sqlLoanLeadsThisMonth = `
            SELECT sourcedBy, COUNT(*) AS count
            FROM loanleads
            WHERE createdOn >= ? 
                AND createdOn < ? 
                AND sourcedBy IN (?) 
                AND leadInternalStatus = 1
            GROUP BY sourcedBy
`;
        const [leadsCounts, loanLeadsCounts, callbacksCounts, leadsCountsThisMonth, loanleadsCountsThisMonth, callbacksCountsThisMonth] = await Promise.all([
            new Promise((resolve, reject) => {
                dbConnect.query(sqlLeads, [today, tomorrow, activeSourcedByIds], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                dbConnect.query(sqlLoanLeads, [today, tomorrow, activeSourcedByIds], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                dbConnect.query(sqlCallbacks, [today, tomorrow, activeSourcedByIds], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                dbConnect.query(sqlLeadsThisMonth, [firstDayOfMonth, nextMonth, activeSourcedByIds], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                dbConnect.query(sqlLoanLeadsThisMonth, [firstDayOfMonth, nextMonth, activeSourcedByIds], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                dbConnect.query(sqlCallbacksThisMonth, [firstDayOfMonth, nextMonth, activeSourcedByIds], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            })
        ]);

        // Prepare final counts
        const finalCounts = activeSourcedByIds.map(id => {
            const leads = leadsCounts.find(item => item.sourcedBy == id) || { count: 0 };
            const loanLeads = loanLeadsCounts.find(item => item.sourcedBy == id) || { count: 0 };
            const callbacks = callbacksCounts.find(item => item.sourcedBy == id) || { count: 0 };
            const leadsThisMonth = leadsCountsThisMonth.find(item => item.sourcedBy == id) || { count: 0 };
            const loanleadsThisMonth = loanleadsCountsThisMonth.find(item => item.sourcedBy == id) || { count: 0 };
            const callbacksThisMonth = callbacksCountsThisMonth.find(item => item.sourcedBy == id) || { count: 0 };
            return {
                sourcedBy: id,
                leadsCount: leads.count + loanLeads.count,
                callbacksCount: callbacks.count,
                thisMonthLeadsCount: leadsThisMonth.count + loanleadsThisMonth.count,
                thisMonthCallbacksCount: callbacksThisMonth.count
            };
        });
        return finalCounts;
    } catch (error) {
        console.error('Error getting leads and callbacks count:', error);
        return [];
    }
}

async function sendLeadsReport() {
    try {
        const counts = await getLeadsAndCallbacksCountForActiveSources();
        const totalLeads = counts.reduce((sum, item) => sum + item.leadsCount, 0);
        const totalCallbacks = counts.reduce((sum, item) => sum + item.callbacksCount, 0);
        const totalLeadsThisMonth = counts.reduce((sum, item) => sum + item.thisMonthLeadsCount, 0);
        const totalCallbacksThisMonth = counts.reduce((sum, item) => sum + item.thisMonthCallbacksCount, 0);
        if (totalLeads === 0 && totalCallbacks === 0) {
            console.log("No leads, callbacks, or loan leads today. Skipping email.");
            return;
        }
        const countsHTML = await Promise.all(counts.map(async (item, index) => {
            const SourcedByName = await getSourceName(item.sourcedBy)
            const joiningDate = await getJoiningDate(item.sourcedBy)
            return `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
                        ${index + 1} <!-- Row index (1-based) -->
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
                        ${SourcedByName.toUpperCase()} <!-- Fetch sourcedBy name -->
                    </td>
                     <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
                        ${joiningDate} <!-- Fetch sourcedBy name -->
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
                        ${item.leadsCount} 
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
                        ${item.callbacksCount} 
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
                        ${item.thisMonthLeadsCount} 
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
                        ${item.thisMonthCallbacksCount} 
                    </td>
                </tr>
            `;
        }));
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); // Example: "Feb 18, 2025"
        // Compose the email
        const currentMonthName = moment().format('MMMM YYYY');
        const mailOptions = {
            from: process.env.EMAIL_USER,
            // to: 'ravi.n@winwaycreators.com, hema.p@winwaycreators.com, hr@winwaycreators.com, mudhiiguubbakalyonnii@gmail.com, cnarendra329@gmail.com',
            to: 'fintalkcrm@gmail.com, hr@winwaycreators.com, mudhiiguubbakalyonnii@gmail.com',
            // to: 'mudhiiguubbakalyonnii@gmail.com, cnarendra329@gmail.com',
            subject: `Today's Metrics: Leads and Callbacks Overview [ ${formattedDate} ]`,
            html: `
                <h2>Today Counts</h2>
                <p><strong>Today Leads:</strong> ${totalLeads}</p>
                <p><strong>Today Callbacks:</strong> ${totalCallbacks}</p>
                <p><strong>${currentMonthName} Leads:</strong> ${totalLeadsThisMonth}</p>
                <p><strong>${currentMonthName} Callbacks:</strong> ${totalCallbacksThisMonth}</p>
                <h2>Sourced By - Leads and Callbacks Summary</h2>
                <table style="min-width: 50%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Sourced By</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Joining Date</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Today Leads</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Today Callbacks</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">${currentMonthName} Leads</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">${currentMonthName} Callbacks</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${countsHTML.join('')}
                    </tbody>
                </table>
            `,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.error('Error sending email:', error);
            }
            console.log('Email sent:', info.response);
        });
    } catch (error) {
        console.error('Error generating leads report:', error);
    }
}




function scheduleCronJobs() {
    cron.schedule('30 14 * * *', () => {
        console.log('Running cron job for today\'s leads count at 8:00 PM');
        sendLeadsReport();
    });
}

// function scheduleCronJobs() {
//     cron.schedule('30 12 * * *', () => {
//         console.log('Running cron job for today\'s leads count at 8:00 PM');
//         sendLeadsReport();
//     });
// }

module.exports = {
    scheduleCronJobs,
};

