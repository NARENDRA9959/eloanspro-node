const asyncHandler = require("express-async-handler");
const handleGlobalFilters = require("../middleware/filtersHandler");
const dbConnect = require("../config/dbConnection");


// const getLeadsCount = asyncHandler(async (req, res) => {
//     let sql = "SELECT count(*) as leadsCount FROM leads";
//     const filtersQuery = handleGlobalFilters(req.query);
//     sql += filtersQuery;
//     dbConnect.query(sql, (err, result) => {
//       if (err) {
//         // throw err; 
//         console.log("getLeadsCount error")
//       }
//       const leadsCount = result[0]['leadsCount'];
//       res.status(200).send(String(leadsCount))
//     });
//   });


  const getLeadCountStatus = asyncHandler(async (req, res) => {
    let sql = `
        SELECT COUNT(*) AS leadCountStatus
        FROM leads
        WHERE leadInternalStatus IN (1, 2)
    `;
    const filtersQuery = handleGlobalFilters(req.query);
    sql += filtersQuery;
    dbConnect.query(sql, (err, result) => {
        if (err) {
            console.error("Error:", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        const leadCountStatus = result[0].leadCountStatus;
        res.status(200).send(String(leadCountStatus))
        
    });
});



const getFilesCountStatus = asyncHandler(async (req, res) => {
  let sql = `
      SELECT COUNT(*) AS filesCountStatus
      FROM leads
      WHERE leadInternalStatus = 3
  `;
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
      if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
      }
      const filesCountStatus = result[0].filesCountStatus;
      // res.status(200).json({ filesCountStatus });
      res.status(200).send(String(filesCountStatus))
  });
});


const getPartialCountStatus = asyncHandler(async (req, res) => {
  let sql = `
      SELECT COUNT(*) AS partialCountStatus
      FROM leads
      WHERE leadInternalStatus = 4
  `;
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
      if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
      }
      const partialCountStatus = result[0].partialCountStatus;
      // res.status(200).json({ status4Count });
      res.status(200).send(String(partialCountStatus))
  });
});


const getCreditEvaluationCountStatus = asyncHandler(async (req, res) => {
  let sql = `
      SELECT COUNT(*) AS creditEvaluationCount
      FROM leads
      WHERE leadInternalStatus = 5
  `;
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
      if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
      }
      const creditEvaluationCount = result[0].creditEvaluationCount;
      // res.status(200).json({ creditEvaluationCount });
      res.status(200).send(String(creditEvaluationCount))
  });
});



const getMonthWiseLeadCountStatus = asyncHandler(async (req, res) => {
  const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "June",
      "July", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  let sql = `
      SELECT 
          YEAR(createdOn) AS year,
          MONTH(createdOn) AS month,
          leadInternalStatus,
          COUNT(*) AS leadCount
      FROM 
          leads
      WHERE 
          leadInternalStatus=1 ${handleGlobalFilters(req.query)}
      GROUP BY 
          YEAR(createdOn),
          MONTH(createdOn),
          leadInternalStatus
      ORDER BY 
          YEAR(createdOn) DESC,
          MONTH(createdOn) DESC,
          leadInternalStatus
  `;

  dbConnect.query(sql, (err, result) => {
      if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
      }

      // Process the query result to structure the data into a list
      const monthWiseLeadCountList = [];
      result.forEach(row => {
          const year = row.year;
          const monthNumber = row.month;
          const monthName = monthNames[monthNumber - 1]; // Adjust the index since month numbers start from 1
          const leadInternalStatus = row.leadInternalStatus;
          const leadCount = row.leadCount;

          // Check if there's an existing entry for the month
          const existingMonthEntry = monthWiseLeadCountList.find(entry => entry.year === year && entry.month === monthName);

          if (existingMonthEntry) {
              // Update the existing entry
              existingMonthEntry.count = leadCount; // Change the key to "count"
          } else {
              // Create a new entry for the month
              const newMonthEntry = {
                  year: year,
                  month: monthName,
                  count: leadCount // Change the key to "count"
              };
              monthWiseLeadCountList.push(newMonthEntry);
          }
      });

      res.status(200).json(monthWiseLeadCountList);        
  });
});



const getMonthWiseCallBacksCount = asyncHandler(async (req, res) => {
  const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "June",
      "July", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  let sql = `
      SELECT 
          YEAR(createdOn) AS year,
          MONTH(createdOn) AS month,
          COUNT(*) AS count
      FROM 
          callbacks
      ${handleGlobalFilters(req.query, true)}
      GROUP BY 
          YEAR(createdOn),
          MONTH(createdOn)
      ORDER BY 
          YEAR(createdOn) DESC,
          MONTH(createdOn) DESC
  `;
  
  dbConnect.query(sql, (err, result) => {
      if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
      }
      
      // Process the query result to structure the data into a list
      const monthWiseCallBacksCountList = [];
      result.forEach(row => {
          const year = row.year;
          const monthNumber = row.month;
          const monthName = monthNames[monthNumber - 1]; // Adjust the index since month numbers start from 1
          const count = row.count;

          // Create a new entry for the month
          const newEntry = {
              year: year,
              month: monthName,
              count: count
          };
          monthWiseCallBacksCountList.push(newEntry);
      });

      res.status(200).json(monthWiseCallBacksCountList);        
  });
});





const getPast7DaysLeadCountStatus = asyncHandler(async (req, res) => {
  

  let sql = `
      SELECT 
          DATE(createdOn) AS date,
          COUNT(*) AS leadCount
      FROM 
          leads
      WHERE 
          leadInternalStatus=1
          AND createdOn >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) ${handleGlobalFilters(req.query)}
      GROUP BY 
          DATE(createdOn)
      ORDER BY 
          DATE(createdOn) ASC
  `;

  dbConnect.query(sql, (err, result) => {
      if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
      }

      // Process the query result to structure the data into a list
      const past7DaysLeadCountList = [];
      result.forEach(row => {
          const date = row.date;
          const leadCount = row.leadCount;

          // Add entry to the list
          const formattedDate = new Date(date).toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
          const newEntry = {
              date: formattedDate,
              count: leadCount // Change the key to "count"
          };
          past7DaysLeadCountList.push(newEntry);
      });
console.log(past7DaysLeadCountList)
      res.status(200).json(past7DaysLeadCountList);        
  });
});


const getPast7DaysCallBacksCount = asyncHandler(async (req, res) => {
 

  let sql = `
      SELECT 
          DATE(createdOn) AS date,
          COUNT(*) AS count
      FROM 
          callbacks
      WHERE 
          createdOn >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) ${handleGlobalFilters(req.query)}
      GROUP BY 
          DATE(createdOn)
      ORDER BY 
          DATE(createdOn) ASC
  `;

  dbConnect.query(sql, (err, result) => {
      if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
      }

      // Process the query result to structure the data into a list
      const past7DaysCallBacksCountList = [];
      result.forEach(row => {
          const date = row.date;
          const count = row.count;

          // Add entry to the list
          const formattedDate = new Date(date).toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
          const newEntry = {
              date: formattedDate,
              count: count
          };
          past7DaysCallBacksCountList.push(newEntry);
      });

      res.status(200).json(past7DaysCallBacksCountList);        
  });
});



const getLastMonthLeadCountStatus = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const lastMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const lastMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

  let sql = `
      SELECT 
          COUNT(*) AS leadCount
      FROM 
          leads
      WHERE 
          leadInternalStatus=1
          AND createdOn >= ? AND createdOn <= ? ${handleGlobalFilters(req.query)}
  `;

  dbConnect.query(sql, [lastMonthStartDate, lastMonthEndDate], (err, result) => {
      if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
      }

      const lastMonthLeadCount = result[0].leadCount;
      res.status(200).json({ leadCount: lastMonthLeadCount });
  });
});



const getLastMonthCallBacksCount = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const lastMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const lastMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

  let sql = `
      SELECT 
          COUNT(*) AS count
      FROM 
          callbacks
      WHERE 
          createdOn >= ? AND createdOn <= ? ${handleGlobalFilters(req.query)}
  `;

  dbConnect.query(sql, [lastMonthStartDate, lastMonthEndDate], (err, result) => {
      if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
      }

      const lastMonthCallBacksCount = result[0].count;
      res.status(200).json({ count: lastMonthCallBacksCount });
  });
});


const getLast6MonthsLeadCountStatus = asyncHandler(async (req, res) => {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "June",
    "July", "Aug", "Sep", "Oct", "Nov", "Dec"
];
  const currentDate = new Date();
  const last6MonthsStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1); // Subtract 5 months to get the start date of the last 6 months
  const lastMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0); // End date is the last day of the current month

  let sql = `
      SELECT 
          YEAR(createdOn) AS year,
          MONTH(createdOn) AS month,
          COUNT(*) AS leadCount
      FROM 
          leads
      WHERE 
          leadInternalStatus=1
          AND createdOn >= ? AND createdOn <= ? ${handleGlobalFilters(req.query)}
      GROUP BY 
          YEAR(createdOn),
          MONTH(createdOn)
  `;

  dbConnect.query(sql, [last6MonthsStartDate, lastMonthEndDate], (err, result) => {
      if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
      }

      // Process the query result to structure the data into a list
      const last6MonthsLeadCountList = [];
      result.forEach(row => {
          const year = row.year;
          const month = row.month;
          const leadCount = row.leadCount;

          // Add entry to the list
          const monthName = monthNames[month - 1]; // Adjust the index since month numbers start from 1
          const newEntry = {
              year: year,
              month: monthName,
              count: leadCount
          };
          last6MonthsLeadCountList.push(newEntry);
      });

      res.status(200).json(last6MonthsLeadCountList);
  });
});



const getLast6MonthsCallBacksCount = asyncHandler(async (req, res) => {

  const currentDate = new Date();
  const last6MonthsStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1); // Start date is 6 months ago
  const lastMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0); // End date is the last day of the current month

  let sql = `
      SELECT 
          COUNT(*) AS count
      FROM 
          callbacks
      WHERE 
          createdOn >= ? AND createdOn <= ? ${handleGlobalFilters(req.query)}
  `;

  dbConnect.query(sql, [last6MonthsStartDate, lastMonthEndDate], (err, result) => {
      if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
      }

      const last6MonthsCallBacksCount = result[0].count;
      res.status(200).json({ count: last6MonthsCallBacksCount });
  });
});


const getLastYearLeadCountStatus = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const lastYearStartDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1); // Start date is 1 year ago from the current month
  const lastYearEndDate = new Date(currentDate.getFullYear() - 1, 11, 31); // End date is the last day of the last year

  let sql = `
      SELECT 
          COUNT(*) AS leadCount
      FROM 
          leads
      WHERE 
          leadInternalStatus = 1
          AND createdOn >= ? AND createdOn <= ? ${handleGlobalFilters(req.query)}
  `;

  dbConnect.query(sql, [lastYearStartDate, lastYearEndDate], (err, result) => {
      if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
      }

      const lastYearLeadCount = result[0].leadCount;
      res.status(200).json({ leadCount: lastYearLeadCount });
  });
});






const getLastYearCallBacksCount = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const lastYearStartDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1); // Start date is 1 year ago from the current month
  const lastYearEndDate = new Date(currentDate.getFullYear() - 1, 11, 31); // End date is the last day of the last year

  let sql = `
      SELECT 
          COUNT(*) AS count
      FROM 
          callbacks
      WHERE 
          createdOn >= ? AND createdOn <= ? ${handleGlobalFilters(req.query)}
  `;

  dbConnect.query(sql, [lastYearStartDate, lastYearEndDate], (err, result) => {
      if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
      }

      const lastYearCallBacksCount = result[0].count;
      res.status(200).json({ count: lastYearCallBacksCount });
  });
});







  module.exports={
    
    getLeadCountStatus,
    getFilesCountStatus,
    getPartialCountStatus,
    getCreditEvaluationCountStatus,
    getMonthWiseLeadCountStatus,
    getMonthWiseCallBacksCount,
    getPast7DaysLeadCountStatus,
    getPast7DaysCallBacksCount,
    getLastMonthLeadCountStatus,
    getLastMonthCallBacksCount,
    getLast6MonthsLeadCountStatus,
    getLast6MonthsCallBacksCount,
    getLastYearCallBacksCount,
    getLastYearLeadCountStatus
  }

