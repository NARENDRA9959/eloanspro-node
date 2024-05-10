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
    res.status(200).send(String(leadCountStatus));
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
    res.status(200).send(String(filesCountStatus));
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
    res.status(200).send(String(partialCountStatus));
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
    res.status(200).send(String(creditEvaluationCount));
  });
});

// const getMonthWiseLeadCountStatus = asyncHandler(async (req, res) => {
//   let sql = `
//   SELECT 
//   YEAR(dates.date) AS year,
//   DATE_FORMAT(dates.date, '%b') AS month,
//   COALESCE(COUNT(leads.id), 0) AS leadCount
// FROM 
//   (
//       SELECT LAST_DAY(DATE_SUB(CURDATE(), INTERVAL (a.a + (10 * b.a) + (100 * c.a)) MONTH)) AS date
//       FROM 
//           (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) AS a
//       CROSS JOIN 
//           (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) AS b
//       CROSS JOIN 
//           (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) AS c
//   ) AS dates
// LEFT JOIN 
//   leads ON YEAR(leads.createdOn) = YEAR(dates.date) AND MONTH(leads.createdOn) = MONTH(dates.date) AND leadInternalStatus = 1
// WHERE 
//   dates.date >= DATE_SUB(LAST_DAY(CURDATE()), INTERVAL 5 MONTH) ${handleGlobalFilters(
//     req.query
//   )}
// GROUP BY 
//   YEAR(dates.date), MONTH(dates.date)
// ORDER BY 
//   YEAR(dates.date) DESC, MONTH(dates.date) DESC ;
// `;

//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.error("Error:", err);
//       res.status(500).send("Internal Server Error");
//       return;
//     }

//     // Process the query result
//     const monthWiseLeadCountList = result;
//     console.log(monthWiseLeadCountList)

//     // Send the result in the response
//     res.status(200).json(monthWiseLeadCountList);
//   });
// });


const getMonthWiseLeadCountStatus = asyncHandler(async (req, res) => {
  try {
    `SELECT 
    YEAR(dates.date) AS year,
    DATE_FORMAT(dates.date, '%b') AS month,
    COALESCE(COUNT(leads.id), 0) AS leadCount
FROM 
    (
        SELECT 
            CONCAT(YEAR(NOW()), '-', LPAD(MONTH(NOW()), 2, '0'), '-01') AS date
        UNION ALL 
        SELECT 
            CONCAT(YEAR(NOW()), '-', LPAD(MONTH(NOW()) - 1, 2, '0'), '-01') AS date
        UNION ALL 
        SELECT 
            CONCAT(YEAR(NOW()), '-', LPAD(MONTH(NOW()) - 2, 2, '0'), '-01') AS date
        UNION ALL 
        SELECT 
            CONCAT(YEAR(NOW()), '-', LPAD(MONTH(NOW()) - 3, 2, '0'), '-01') AS date
        UNION ALL 
        SELECT 
            CONCAT(YEAR(NOW()), '-', LPAD(MONTH(NOW()) - 4, 2, '0'), '-01') AS date
    ) AS dates
LEFT JOIN 
    leads ON YEAR(leads.createdOn) = YEAR(dates.date) 
        AND MONTH(leads.createdOn) = MONTH(dates.date) 
        AND leadInternalStatus = 1
WHERE 
    dates.date >= CONCAT(YEAR(NOW()), '-', LPAD(MONTH(NOW()) - 5, 2, '0'), '-01')
GROUP BY 
    YEAR(dates.date), 
    MONTH(dates.date)
ORDER BY 
    YEAR(dates.date) DESC, 
    MONTH(dates.date) DESC;
`
    dbConnect.query(sql, (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Severver Error");
        return;
      }

      // Process the query result
      const monthWiseLeadCountList = result;
      console.log(monthWiseLeadCountList);

      // Send the result in the response
      res.status(200).json(monthWiseLeadCountList);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// const getMonthWiseCallBacksCount = asyncHandler(async (req, res) => {
//   let sql = `
//     SELECT 
//       YEAR(dates.date) AS year,
//       DATE_FORMAT(dates.date, '%b') AS month,
//       COALESCE(COUNT(callbacks.id), 0) AS callbacksCount
//     FROM 
//       (
//           SELECT LAST_DAY(DATE_SUB(CURDATE(), INTERVAL (a.a + (10 * b.a) + (100 * c.a)) MONTH)) AS date
//           FROM 
//               (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) AS a
//           CROSS JOIN 
//               (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) AS b
//           CROSS JOIN 
//               (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) AS c
//       ) AS dates
//     LEFT JOIN 
//       callbacks ON YEAR(callbacks.createdOn) = YEAR(dates.date) AND MONTH(callbacks.createdOn) = MONTH(dates.date)
//     WHERE 
//       dates.date >= DATE_SUB(LAST_DAY(CURDATE()), INTERVAL 5 MONTH) ${handleGlobalFilters(
//         req.query
//       )}
//     GROUP BY 
//       YEAR(dates.date), MONTH(dates.date)
//     ORDER BY 
//       YEAR(dates.date) DESC, MONTH(dates.date) DESC ;
//   `;

//   dbConnect.query(sql, (err, result) => {
//     console.log(result)
//     if (err) {
//       console.error("Error:", err);
//       res.status(500).send("Internal Server Error");
//       return;
//     }
//     // Process the query result
//     const monthWiseCallbacksCountList = result;
//     //console.log(monthWiseCallbacksCountList)
//     // Send the result in the response
//     res.status(200).json(monthWiseCallbacksCountList);
//   });
// });


const getMonthWiseCallBacksCount = asyncHandler(async (req, res) => {
  try {
  `SELECT 
  YEAR(dates.date) AS year,
  DATE_FORMAT(dates.date, '%b') AS month,
  COALESCE(COUNT(callbacks.id), 0) AS callbacksCount
FROM 
  (
      SELECT 
          CONCAT(YEAR(NOW()), '-', LPAD(MONTH(NOW()), 2, '0'), '-01') AS date
      UNION ALL 
      SELECT 
          CONCAT(YEAR(NOW()), '-', LPAD(MONTH(NOW()) - 1, 2, '0'), '-01') AS date
      UNION ALL 
      SELECT 
          CONCAT(YEAR(NOW()), '-', LPAD(MONTH(NOW()) - 2, 2, '0'), '-01') AS date
      UNION ALL 
      SELECT 
          CONCAT(YEAR(NOW()), '-', LPAD(MONTH(NOW()) - 3, 2, '0'), '-01') AS date
      UNION ALL 
      SELECT 
          CONCAT(YEAR(NOW()), '-', LPAD(MONTH(NOW()) - 4, 2, '0'), '-01') AS date
  ) AS dates
LEFT JOIN 
  callbacks ON YEAR(callbacks.createdOn) = YEAR(dates.date) 
      AND MONTH(callbacks.createdOn) = MONTH(dates.date)
WHERE 
  dates.date >= CONCAT(YEAR(NOW()), '-', LPAD(MONTH(NOW()) - 5, 2, '0'), '-01')
GROUP BY 
  YEAR(dates.date), 
  MONTH(dates.date)
ORDER BY 
  YEAR(dates.date) DESC, 
  MONTH(dates.date) DESC;
`
    dbConnect.query(sql, (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Sevwerrver Error");
        return;
      }
      
      // Process the query result
      const monthWiseCallbacksCountList = result;
      res.status(200).json(monthWiseCallbacksCountList);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

const getPast7DaysLeadCountStatus = asyncHandler(async (req, res) => {
  let sql = `SELECT 
      COUNT(*) AS leadCount
    FROM 
      leads
    WHERE 
      leadInternalStatus = 1
      AND createdOn >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) ${handleGlobalFilters(
        req.query
      )};`;

  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Process the query result
    const past7DaysLeadCount = result[0].leadCount; // Get the leadCount directly from the result

    // Send the count in the response
    res.status(200).send(String(past7DaysLeadCount));
  });
});

const getPast7DaysCallBacksCount = asyncHandler(async (req, res) => {
  let sql = `
        SELECT 
            COUNT(*) AS count
        FROM 
            callbacks
        WHERE 
            createdOn >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) ${handleGlobalFilters(
              req.query
            )}
    `;

  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Process the query result
    const past7DaysCallBacksCount = result[0].count; // Get the count directly from the result

    // Send the count in the response
    res.status(200).send(String(past7DaysCallBacksCount));
  });
});

const getLastMonthLeadCountStatus = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const lastMonthStartDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );
  const lastMonthEndDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  );

  let sql = `
      SELECT 
          COUNT(*) AS leadCount
      FROM 
          leads
      WHERE 
          leadInternalStatus=1
          AND createdOn >= ? AND createdOn <= ? ${handleGlobalFilters(
            req.query
          )}
  `;

  dbConnect.query(
    sql,
    [lastMonthStartDate, lastMonthEndDate],
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      const lastMonthLeadCount = result[0].leadCount;
      res.status(200).json({ leadCount: lastMonthLeadCount });
    }
  );
});

const getLastMonthCallBacksCount = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const lastMonthStartDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );
  const lastMonthEndDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  );

  let sql = `
      SELECT 
          COUNT(*) AS count
      FROM 
          callbacks
      WHERE 
          createdOn >= ? AND createdOn <= ? ${handleGlobalFilters(req.query)}
  `;

  dbConnect.query(
    sql,
    [lastMonthStartDate, lastMonthEndDate],
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      const lastMonthCallBacksCount = result[0].count;
      res.status(200).json({ count: lastMonthCallBacksCount });
    }
  );
});

const getLast6MonthsLeadCountStatus = asyncHandler(async (req, res) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentDate = new Date();
  const last6MonthsStartDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 5,
    1
  ); // Subtract 5 months to get the start date of the last 6 months
  const lastMonthEndDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  ); // End date is the last day of the current month

  let sql = `
      SELECT 
          YEAR(createdOn) AS year,
          MONTH(createdOn) AS month,
          COUNT(*) AS leadCount
      FROM 
          leads
      WHERE 
          leadInternalStatus=1
          AND createdOn >= ? AND createdOn <= ? ${handleGlobalFilters(
            req.query
          )}
      GROUP BY 
          YEAR(createdOn),
          MONTH(createdOn)
  `;

  dbConnect.query(
    sql,
    [last6MonthsStartDate, lastMonthEndDate],
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // Process the query result to structure the data into a list
      const last6MonthsLeadCountList = [];
      result.forEach((row) => {
        const year = row.year;
        const month = row.month;
        const leadCount = row.leadCount;

        // Add entry to the list
        const monthName = monthNames[month - 1]; // Adjust the index since month numbers start from 1
        const newEntry = {
          year: year,
          month: monthName,
          count: leadCount,
        };
        last6MonthsLeadCountList.push(newEntry);
      });

      res.status(200).json(last6MonthsLeadCountList);
    }
  );
});

const getLast6MonthsCallBacksCount = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const last6MonthsStartDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 6,
    1
  ); // Start date is 6 months ago
  const lastMonthEndDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  ); // End date is the last day of the current month

  let sql = `
      SELECT 
          COUNT(*) AS count
      FROM 
          callbacks
      WHERE 
          createdOn >= ? AND createdOn <= ? ${handleGlobalFilters(req.query)}
  `;

  dbConnect.query(
    sql,
    [last6MonthsStartDate, lastMonthEndDate],
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      const last6MonthsCallBacksCount = result[0].count;
      res.status(200).json({ count: last6MonthsCallBacksCount });
    }
  );
});

const getLastYearLeadCountStatus = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const lastYearStartDate = new Date(
    currentDate.getFullYear() - 1,
    currentDate.getMonth(),
    1
  ); // Start date is 1 year ago from the current month
  const lastYearEndDate = new Date(currentDate.getFullYear() - 1, 11, 31); // End date is the last day of the last year

  let sql = `
      SELECT 
          COUNT(*) AS leadCount
      FROM 
          leads
      WHERE 
          leadInternalStatus = 1
          AND createdOn >= ? AND createdOn <= ? ${handleGlobalFilters(
            req.query
          )}
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
  const lastYearStartDate = new Date(
    currentDate.getFullYear() - 1,
    currentDate.getMonth(),
    1
  ); // Start date is 1 year ago from the current month
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

const getDaywiseLeadsCount = asyncHandler(async (req, res) => {
  let sql = `
    SELECT 
      DATE_FORMAT(dateList.date, '%a') AS dayName,
      DATE(dateList.date) AS date,
      COALESCE(COUNT(leads.id), 0) AS leadCount
    FROM 
      (
        SELECT CURDATE() - INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY AS date
        FROM 
          (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS a
          CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS b
          CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS c
      ) AS dateList
    LEFT JOIN leads ON DATE(leads.createdOn) = dateList.date
    WHERE 
      dateList.date BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE() -- Select data for the last 7 days only
      AND dateList.date < CURDATE() -- Exclude today's date
      ${handleGlobalFilters(req.query)}
    GROUP BY 
      DATE(dateList.date)
    ORDER BY
      DATE(dateList.date) DESC; -- Order by date in descending order to get the last 7 days
  `;

  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Process the query result
    const past7DaysLeadsCount = result; // Get the lead count for the last 7 days

    // Send the count in the response
    res.status(200).send(past7DaysLeadsCount);
  });
});

const getDaywiseCallBacksCount = asyncHandler(async (req, res) => {
  let sql = `
    SELECT 
      DATE_FORMAT(dateList.date, '%a') AS dayName,
      DATE(dateList.date) AS date,
      COALESCE(COUNT(callbacks.id), 0) AS callBackCount
    FROM 
      (
        SELECT CURDATE() - INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY AS date
        FROM 
          (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS a
          CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS b
          CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS c
      ) AS dateList
    LEFT JOIN callbacks ON DATE(callbacks.createdOn) = dateList.date
    WHERE 
      dateList.date BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE() -- Select data for the last 7 days only
      AND dateList.date < CURDATE() -- Exclude today's date
      ${handleGlobalFilters(req.query)}
    GROUP BY 
      DATE(dateList.date)
    ORDER BY
      DATE(dateList.date) DESC; -- Order by date in descending order to get the last 7 days
  `;

  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Process the query result
    const past7DaysCallBacksCount = result; // Get the callback count for the last 7 days

    // Send the count in the response
    res.status(200).send(past7DaysCallBacksCount);
  });
});

module.exports = {
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
  getLastYearLeadCountStatus,
  getDaywiseLeadsCount,
  getDaywiseCallBacksCount,
};
