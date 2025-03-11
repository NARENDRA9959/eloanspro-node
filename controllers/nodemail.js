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
        // Query leads count
        const leadsCountPromise = new Promise((resolve, reject) => {
            dbConnect.query(sqlLeads, [today, tomorrow, activeSourcedByIds], (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log(result)
                resolve(result);

            });
        });

        // Query callbacks count
        const callbacksCountPromise = new Promise((resolve, reject) => {
            dbConnect.query(sqlCallbacks, [today, tomorrow, activeSourcedByIds], (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });


        const loanLeadsCountPromise = new Promise((resolve, reject) => {
            dbConnect.query(sqlLoanLeads, [today, tomorrow, activeSourcedByIds], (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
        // Wait for both queries to complete
        const [leadsCounts, loanLeadsCounts, callbacksCounts] = await Promise.all([
            leadsCountPromise, loanLeadsCountPromise, callbacksCountPromise
        ]);

        // Prepare final counts
        const finalCounts = activeSourcedByIds.map(id => {
            const leads = leadsCounts.find(item => item.sourcedBy == id) || { count: 0 };
            const loanLeads = loanLeadsCounts.find(item => item.sourcedBy == id) || { count: 0 };
            const callbacks = callbacksCounts.find(item => item.sourcedBy == id) || { count: 0 };
            // console.log("loanLeads.count", loanLeads.count)
            return {
                sourcedBy: id,
                leadsCount: leads.count + loanLeads.count, // Combine counts from both tables
                callbacksCount: callbacks.count
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
        // Get the final leads and callbacks counts for active sourcedBy IDs
        const counts = await getLeadsAndCallbacksCountForActiveSources();

        // Calculate total leads and callbacks
        const totalLeads = counts.reduce((sum, item) => sum + item.leadsCount, 0);
        const totalCallbacks = counts.reduce((sum, item) => sum + item.callbacksCount, 0);
        if (totalLeads === 0 && totalCallbacks === 0) {
            console.log("No leads, callbacks, or loan leads today. Skipping email.");
            return;
        }
        // Generate the HTML for sourcedBy-wise counts
        const countsHTML = await Promise.all(counts.map(async (item, index) => {
            const SourcedByName = await getSourceName(item.sourcedBy)
            return `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
                        ${index + 1} <!-- Row index (1-based) -->
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
                        ${SourcedByName.toUpperCase()} <!-- Fetch sourcedBy name -->
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
                        ${item.leadsCount} 
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
                        ${item.callbacksCount} 
                    </td>
                </tr>
            `;
        }));
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); // Example: "Feb 18, 2025"
        // Compose the email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'ravi.n@winwaycreators.com, hema.p@winwaycreators.com, hr@winwaycreators.com, mudhiiguubbakalyonnii@gmail.com, cnarendra329@gmail.com',
            // to: 'mudhiiguubbakalyonnii@gmail.com, cnarendra329@gmail.com',
            subject: `Today's Metrics: Leads and Callbacks Overview [ ${formattedDate} ]`,
            html: `
                <h2>Today Counts</h2>
                <p><strong>Today Leads:</strong> ${totalLeads}</p>
                <p><strong>Today Callbacks:</strong> ${totalCallbacks}</p>
                <h2>Sourced By - Leads and Callbacks Summary</h2>
                <table style="min-width: 50%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Sourced By</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Leads Count</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Callbacks Count</th>
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



// async function getTotalCount(tableName) {
//     const today = moment().startOf('day').format('YYYY-MM-DD');
//     const tomorrow = moment().add(1, 'days').startOf('day').format('YYYY-MM-DD');

//     const sql = `
//         SELECT sourcedBy, COUNT(*) AS count
//         FROM ?? 
//         WHERE createdOn >= ? AND createdOn < ?
//         GROUP BY sourcedBy
//     `;

//     return new Promise((resolve, reject) => {
//         dbConnect.query(sql, [tableName, today, tomorrow], (err, result) => {
//             if (err) {
//                 reject(err);
//                 return;
//             }

//             // If result is not empty, return the counts
//             const counts = result.map(row => ({
//                 sourcedBy: row.sourcedBy,
//                 count: row.count
//             }));

//             resolve(counts);
//         });
//     });
// }


// async function sendLeadsReport() {
//     try {
//         // Get leads and callbacks counts
//         const leadsCounts = await getTotalCount('leads');
//         const callbacksCounts = await getTotalCount('callbacks');

//         // Generate the HTML for leads and callbacks counts (with proper async handling)
//         const leadsCountsHTMLPromises = leadsCounts.map(async (item) => {
//             const sourcedByName = await getSourceName(item.sourcedBy);  // Await the sourcedBy name
//             return `
//                 <tr>
//                     <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
//                         ${sourcedByName}
//                     </td>
//                     <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
//                         ${item.count} 
//                     </td>
//                 </tr>
//             `;
//         });

//         const callbacksCountsHTMLPromises = callbacksCounts.map(async (item) => {
//             const sourcedByName = await getSourceName(item.sourcedBy);  // Await the sourcedBy name
//             return `
//                 <tr>
//                     <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
//                         ${sourcedByName}
//                     </td>
//                     <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">
//                         ${item.count} 
//                     </td>
//                 </tr>
//             `;
//         });

//         // Wait for all promises to resolve
//         const leadsCountsHTML = (await Promise.all(leadsCountsHTMLPromises)).join('');
//         const callbacksCountsHTML = (await Promise.all(callbacksCountsHTMLPromises)).join('');

//         // Compose the email
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: 'mudhiiguubbakalyonnii@gmail.com, cnarendra329@gmail.com',
//             subject: 'The FinTalk Daily Metrics',
//             html: `
//                 <h1>Daily Report</h1>
//                 <p>Here are today's counts:</p>
//                 <div style="margin-bottom: 16px;">
//                     <strong>Total Leads:</strong> ${leadsCounts.reduce((total, item) => total + item.count, 0)}
//                 </div>
//                 <div style="margin-bottom: 16px;">
//                     <strong>Total Callbacks:</strong> ${callbacksCounts.reduce((total, item) => total + item.count, 0)}
//                 </div>

//                 <h2>Sourced By Counts (Leads)</h2>
//                 <table style="min-width: 50%; border-collapse: collapse;">
//                     <thead>
//                         <tr>
//                             <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Sourced By</th>
//                             <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Leads Count</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${leadsCountsHTML}
//                     </tbody>
//                 </table>

//                 <h2>Sourced By Counts (Callbacks)</h2>
//                 <table style="width: 100%; border-collapse: collapse;">
//                     <thead>
//                         <tr>
//                             <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Sourced By</th>
//                             <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Callbacks Count</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${callbacksCountsHTML}
//                     </tbody>
//                 </table>

//                 <p>Thank you!</p>
//             `,
//         };

//         // Send the email
//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 return console.error('Error sending email:', error);
//             }
//             console.log('Email sent:', info.response);
//         });
//     } catch (error) {
//         console.error('Error generating leads report:', error);
//     }
// }



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

