// const cron = require('node-cron');
// const nodemailer = require('nodemailer');
// const moment = require('moment');
// const dbConnect = require("../config/dbConnection");

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });
// async function getTotalCount(tableName) {
//     const today = moment().startOf('day').format('YYYY-MM-DD');
//     const tomorrow = moment().add(1, 'days').startOf('day').format('YYYY-MM-DD');

//     const sql = `
//         SELECT COUNT(*) AS count 
//         FROM ?? 
//         WHERE createdOn >= ? AND createdOn < ?
//     `;

//     return new Promise((resolve, reject) => {
//         dbConnect.query(sql, [tableName, today, tomorrow], (err, result) => {
//             if (err) {
//                 reject(err);
//                 return;
//             }
//             const count = result.length > 0 ? result[0].count : 0;
//             resolve(count);
//         });
//     });
// }



// async function sendLeadsReport() {
//     try {
//         const totalLeads = await getTotalCount('leads');
//         const totalCallbacks = await getTotalCount('callbacks');
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: 'mudhiiguubbakalyonnii4@gmail.com',
//             subject: 'The FinTalk Daily Metrics',
//             html: `
//             <h1>Daily Report</h1>
//             <p>Here are today's counts:</p>
//             <div style="margin-bottom: 16px;">
//            <strong>Total Leads:</strong> ${totalLeads}
//             </div>
//             <div style="margin-bottom: 16px;">
//             <strong>Total Callbacks:</strong> ${totalCallbacks}
//             </div>
//             <p>Thank you!</p>
//         `,
//         };
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

// function scheduleCronJobs() {
//     cron.schedule('02 15 * * *', () => {
//         console.log('Running cron job for today\'s leads count at 8:00 AM');
//         sendLeadsReport();
//     });
// }

// module.exports = {
//     scheduleCronJobs,
// };

