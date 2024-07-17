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
  let sql = "SELECT COUNT(*) AS leadCountStatus FROM leads";
  const queryParams = req.query || {};
  queryParams["leadInternalStatus-or"] = "1";
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
const getCallbackCountStatus = asyncHandler(async (req, res) => {
  let sql = "SELECT COUNT(*) AS callbackCountStatus FROM callbacks";
  const queryParams = req.query || {};
  queryParams["callbackInternalStatus-or"] = "1";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const callbackCountStatus = result[0].callbackCountStatus;
    res.status(200).send(String(callbackCountStatus));
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
    res.status(200).send(String(filesCountStatus));
  });
});

const getRejectedCountStatus = asyncHandler(async (req, res) => {
  // let sql = `
  //     SELECT COUNT(*) AS rejectsCountStatus
  //     FROM leads
  //     WHERE leadInternalStatus = 10,14,15
  // `;
  let sql = `
    SELECT COUNT(*) AS rejectsCountStatus
    FROM leads
    WHERE leadInternalStatus IN (10, 14, 15)
`;

  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const rejectsCountStatus = result[0].rejectsCountStatus;
    res.status(200).send(String(rejectsCountStatus));
  });
});
const getLoginsCountStatus = asyncHandler(async (req, res) => {
  let sql = `
    SELECT COUNT(*) AS loginsCountStatus
    FROM leads
    WHERE leadInternalStatus IN (11)
`;
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const loginsCountStatus = result[0].loginsCountStatus;
    res.status(200).send(String(loginsCountStatus));
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
    res.status(200).send(String(partialCountStatus));
  });
});

const getApprovalsCountStatus = asyncHandler(async (req, res) => {
  let sql = `
      SELECT COUNT(*) AS approvalCountStatus
      FROM leads
      WHERE leadInternalStatus = 7
  `;
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const approvalCountStatus = result[0].approvalCountStatus;
    res.status(200).send(String(approvalCountStatus));
  });
});

const getDisbursalsCountStatus = asyncHandler(async (req, res) => {
  let sql = `
      SELECT COUNT(*) AS disbursalsCountStatus
      FROM leads
      WHERE leadInternalStatus = 8
  `;
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const disbursalsCountStatus = result[0].disbursalsCountStatus;
    res.status(200).send(String(disbursalsCountStatus));
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
    res.status(200).send(String(creditEvaluationCount));
  });
});

const getMonthWiseLeadCountStatus = asyncHandler(async (req, res) => {
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
  //   dates.date >= DATE_SUB(LAST_DAY(CURDATE()), INTERVAL 5 MONTH)
  // GROUP BY 
  //   YEAR(dates.date),MONTH(dates.date)
  // ORDER BY 
  //   YEAR(dates.date) DESC, MONTH(dates.date) DESC;
  // `;

  let sql = `SELECT 
      DATE_FORMAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL seq MONTH)), '%b') AS month,
      COALESCE(
        (
          SELECT COUNT(leads.id)
          FROM leads 
          WHERE leadInternalStatus = 1 
          AND YEAR(leads.createdOn) = YEAR(DATE_SUB(CURDATE(), INTERVAL seq MONTH))
          AND MONTH(leads.createdOn) = MONTH(DATE_SUB(CURDATE(), INTERVAL seq MONTH))
        ), 0
      ) AS leadCount
    FROM 
      (SELECT 0 AS seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) AS seq
    ORDER BY 
      seq DESC; `
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const monthWiseLeadCountList = result;
    res.status(200).json(monthWiseLeadCountList);
  });
});
const getMonthWiseCallBacksCount = asyncHandler(async (req, res) => {
  // let sql = `
  //   SELECT 
  //     YEAR(dates.date) AS year,
  //     DATE_FORMAT(dates.date, '%b') AS month,
  //     COALESCE(COUNT(callbacks.id), 0) AS callbacksCount
  //   FROM 
  //     (
  //         SELECT LAST_DAY(DATE_SUB(CURDATE(), INTERVAL (a.a + (10 * b.a) + (100 * c.a)) MONTH)) AS date
  //         FROM 
  //             (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) AS a
  //         CROSS JOIN 
  //             (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) AS b
  //         CROSS JOIN 
  //             (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) AS c
  //     ) AS dates
  //   LEFT JOIN 
  //     callbacks ON YEAR(callbacks.createdOn) = YEAR(dates.date) AND MONTH(callbacks.createdOn) = MONTH(dates.date)
  //   WHERE 
  //     dates.date >= DATE_SUB(LAST_DAY(CURDATE()), INTERVAL 5 MONTH)
  //   GROUP BY 
  //     YEAR(dates.date), MONTH(dates.date)
  //   ORDER BY 
  //     YEAR(dates.date) DESC, MONTH(dates.date) DESC;
  // `;



  let sql = `SELECT 
DATE_FORMAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL seq MONTH)), '%b') AS month,
COALESCE(
  (
    SELECT COUNT(callbacks.id)
    FROM callbacks 
    WHERE callbackInternalStatus = 1 
    AND YEAR(callbacks.createdOn) = YEAR(DATE_SUB(CURDATE(), INTERVAL seq MONTH))
    AND MONTH(callbacks.createdOn) = MONTH(DATE_SUB(CURDATE(), INTERVAL seq MONTH))
  ), 0
) AS callbackCount
FROM 
(SELECT 0 AS seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) AS seq
ORDER BY 
seq DESC; `
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const monthWiseCallbacksCountList = result;
   // console.log(monthWiseCallbacksCountList)
    res.status(200).json(monthWiseCallbacksCountList);
  });
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
    const past7DaysLeadCount = result[0].leadCount;
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
    const past7DaysCallBacksCount = result[0].count;
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
  );
  const lastMonthEndDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  );
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
      const last6MonthsLeadCountList = [];
      result.forEach((row) => {
        const year = row.year;
        const month = row.month;
        const leadCount = row.leadCount;
        const monthName = monthNames[month - 1];
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
  );
  const lastYearEndDate = new Date(currentDate.getFullYear() - 1, 11, 31);
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
  );
  const lastYearEndDate = new Date(currentDate.getFullYear() - 1, 11, 31);
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
  //  let sql=` WITH RECURSIVE DateList AS (
  //   SELECT CURDATE() - INTERVAL 6 DAY AS date
  //   UNION ALL
  //   SELECT date + INTERVAL 1 DAY
  //   FROM DateList
  //   WHERE date < CURDATE() - INTERVAL 1 DAY
  // )
  // SELECT
  //   DATE_FORMAT(DateList.date, '%a') AS dayName,

  //   COALESCE(COUNT(leads.id), 0) AS leadCount
  // FROM
  //   DateList
  // LEFT JOIN leads ON DATE(leads.createdOn) = DateList.date
  // WHERE
  //   DateList.date BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE() - INTERVAL 1 DAY
  //   ${handleGlobalFilters(req.query)}
  // GROUP BY
  //   DATE(DateList.date)
  // ORDER BY
  // DATE(DateList.date) DESC;`
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal month leads Error");
      return;
    }
    const past7DaysLeadsCount = result;
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
      DATE(dateList.date);
    ORDER BY
      DATE(dateList.date) DESC; -- Order by date in descending order to get the last 7 days
  `;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const past7DaysCallBacksCount = result;
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
  getCallbackCountStatus,
  getRejectedCountStatus,
  getLoginsCountStatus,
  getApprovalsCountStatus,
  getDisbursalsCountStatus,
};
