const asyncHandler = require("express-async-handler");
const handleGlobalFilters = require("../middleware/filtersHandler");
const dbConnect = require("../config/dbConnection");
const moment = require('moment');

const getLeadCountStatus = asyncHandler(async (req, res) => {
  let sql = "SELECT COUNT(*) AS leadCountStatus FROM leads";
  const queryParams = req.query || {};
  queryParams["leadInternalStatus-or"] = "1";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).send("Error in Fetching the Lead Count");
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
      return res.status(500).send("Error in Fetching the Callback Count");
    }
    const callbackCountStatus = result[0].callbackCountStatus;
    res.status(200).send(String(callbackCountStatus));
  });
});
const getFilesCountStatus = asyncHandler(async (req, res) => {
  let sql = `
      SELECT COUNT(*) AS filesCountStatus
      FROM leads
  `;
  const queryParams = req.query;
  queryParams["leadInternalStatus-eq"] = "3";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;

  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Error in Fetching the Files Count");
      return;
    }
    const filesCountStatus = result[0].filesCountStatus;
    res.status(200).send(String(filesCountStatus));
  });
});

const getRejectedCountStatus = asyncHandler(async (req, res) => {
  let sql = `
    SELECT COUNT(*) AS rejectsCountStatus
    FROM leads
`;
  const queryParams = req.query;
  queryParams["leadInternalStatus-eq"] = "10";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Error in Fetching Rejected Count");
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
`;
  const queryParams = req.query;
  queryParams["leadInternalStatus-eq"] = "11";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Error in Fetching Logins Count");
      return;
    }
    const loginsCountStatus = result[0].loginsCountStatus;
    res.status(200).send(String(loginsCountStatus));
  });
});

// const getPartialCountStatus = asyncHandler(async (req, res) => {
//   let sql = `
//       SELECT COUNT(*) AS partialCountStatus
//       FROM leads
//   `;
//   const queryParams = req.query;
//   queryParams["leadInternalStatus-eq"] = "4";
//   const filtersQuery = handleGlobalFilters(queryParams);
//   sql += filtersQuery;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.error("Error:", err);
//       res.status(500).send("Error in Fetching the Partials Count");
//       return;
//     }
//     const partialCountStatus = result[0].partialCountStatus;
//     res.status(200).send(String(partialCountStatus));
//   });
// });


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
      res.status(500).send("Error in Fetching Credit Evaluation Count");
      return;
    }
    const creditEvaluationCount = result[0].creditEvaluationCount;
    res.status(200).send(String(creditEvaluationCount));
  });
});

const getMonthWiseLeadCountStatus = asyncHandler(async (req, res) => {
  let sql = `
    SELECT 
      DATE_FORMAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL seq MONTH)), '%b') AS month,
      YEAR(DATE_SUB(CURDATE(), INTERVAL seq MONTH)) AS year,
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
      seq DESC;
  `;

  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Error in Fetching the Month wise Leads Count");
      return;
    }
    const months = result.map(item => `${item.month} ${item.year}`);
    const leadCounts = result.map(item => item.leadCount);
    res.status(200).json({ months, leadCounts });
  });
});
const getMonthWiseCallBacksCount = asyncHandler(async (req, res) => {
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
      res.status(500).send("Error in Fetching Monthwise Callback Count");
      return;
    }
    const callbackCounts = result.map(item => item.callbackCount);
    res.status(200).json({ callbackCounts });
  });
});

const getPast7DaysLeadCountStatus = asyncHandler(async (req, res) => {
  let sql = `SELECT 
      COUNT(*) AS leadCount
    FROM leads`;
  const queryParams = req.query;
  queryParams["leadInternalStatus-eq"] = "1";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  let sql2 = ` AND createdOn >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
  sql += sql2;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Error in Fetching past 7 days Lead Count");
      return;
    }
    const past7DaysLeadCount = result[0].leadCount;
    res.status(200).send(String(past7DaysLeadCount));
  });
});

const getPast7DaysCallBacksCount = asyncHandler(async (req, res) => {
  let sql = `SELECT 
  COUNT(*) AS count
FROM callbacks`;
  const queryParams = req.query;
  queryParams["callbackInternalStatus-eq"] = "1";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  let sql2 = ` AND createdOn >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`;
  sql += sql2;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Error in Fetching Past 7 days Callback Count");
      return;
    }
    const past7DaysCallBacksCount = result[0].count;
    res.status(200).send(String(past7DaysCallBacksCount));
  });
});
const getLastMonthLeadCountStatus = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const lastMonthStartDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  )).format('YYYY-MM-DD');
  const lastMonthEndDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  )).add(1, 'days').format('YYYY-MM-DD');
  let sql = `SELECT 
  COUNT(*) AS leadCount
FROM leads`;
  const queryParams = req.query;
  queryParams["leadInternalStatus-eq"] = "1";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  let sql2 = ` AND createdOn >= ? AND createdOn <= ?`;
  sql += sql2;
  dbConnect.query(
    sql,
    [lastMonthStartDate, lastMonthEndDate],
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Error in Fetching Last month Leads Count");
        return;
      }
      const lastMonthLeadCount = result[0].leadCount;
      res.status(200).send(String(lastMonthLeadCount));
    }
  );
});

const getThisMonthLeadCountStatus = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const thisMonthStartDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  )).format('YYYY-MM-DD');
  const thisMonthEndDate = moment(currentDate).format('YYYY-MM-DD');
  let sql = `SELECT 
  COUNT(*) AS leadCount
  FROM leads`;
  const queryParams = req.query;
  queryParams["leadInternalStatus-eq"] = "1";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  let sql2 = ` AND createdOn >= ? AND createdOn <= ?`;
  sql += sql2;
  dbConnect.query(
    sql,
    [thisMonthStartDate, thisMonthEndDate],
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Error in Fetching This month Leads Count");
        return;
      }
      const thisMonthLeadCount = result[0].leadCount;
      res.status(200).send(String(thisMonthLeadCount));
    }
  );
});

const getLastBeforeMonthLeadCountStatus = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const lastBeforeMonthStartDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 2,
    1
  )).format('YYYY-MM-DD');
  const lastBeforeMonthEndDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    0
  )).add(1, 'days').format('YYYY-MM-DD');
  let sql = `SELECT 
  COUNT(*) AS leadCount
  FROM leads`;
  const queryParams = req.query;
  queryParams["leadInternalStatus-eq"] = "1";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  let sql2 = ` AND createdOn >= ? AND createdOn <= ?`;
  sql += sql2;
  dbConnect.query(
    sql,
    [lastBeforeMonthStartDate, lastBeforeMonthEndDate],
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Error in Fetching Leads Count");
        return;
      }
      const lastBeforeMonthLeadCount = result[0].leadCount;
      res.status(200).send(String(lastBeforeMonthLeadCount));
    }
  );
});

const getLastMonthCallBacksCount = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const lastMonthStartDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  )).format('YYYY-MM-DD');
  const lastMonthEndDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  )).add(1, 'days').format('YYYY-MM-DD');
  let sql = `SELECT 
  COUNT(*) AS count
FROM callbacks`;
  const queryParams = req.query;
  queryParams["callbackInternalStatus-eq"] = "1";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  let sql2 = ` AND createdOn >= ? AND createdOn <= ?`;
  sql += sql2;
  dbConnect.query(
    sql,
    [lastMonthStartDate, lastMonthEndDate],
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Error in Fetching last month Callbacks Count");
        return;
      }
      const lastMonthCallBacksCount = result[0].count;
      res.status(200).send(String(lastMonthCallBacksCount));
    }
  );
});

const getThisMonthCallBacksCount = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const thisMonthStartDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  )).format('YYYY-MM-DD');
  const thisMonthEndDate = moment(currentDate).format('YYYY-MM-DD');
  let sql = `SELECT 
  COUNT(*) AS count
  FROM callbacks`;
  const queryParams = req.query;
  queryParams["callbackInternalStatus-eq"] = "1";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  let sql2 = ` AND createdOn >= ? AND createdOn <= ?`;
  sql += sql2;

  dbConnect.query(
    sql,
    [thisMonthStartDate, thisMonthEndDate],
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Error in Fetching This Month Callbacks Count");
        return;
      }
      const thisMonthCallBacksCount = result[0].count;
      res.status(200).send(String(thisMonthCallBacksCount));
    }
  );
});

const getTwoMonthsAgoCallBacksCount = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const twoMonthsAgoStartDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 2,
    1
  )).format('YYYY-MM-DD');
  const twoMonthsAgoEndDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    0
  )).add(1, 'days').format('YYYY-MM-DD');
  let sql = `SELECT 
  COUNT(*) AS count
  FROM callbacks`;
  const queryParams = req.query;
  queryParams["callbackInternalStatus-eq"] = "1";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  let sql2 = ` AND createdOn >= ? AND createdOn <= ?`;
  sql += sql2;
  dbConnect.query(
    sql,
    [twoMonthsAgoStartDate, twoMonthsAgoEndDate],
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Error in Fetching  Callbacks Count");
        return;
      }
      const twoMonthsAgoCallBacksCount = result[0].count;
      res.status(200).send(String(twoMonthsAgoCallBacksCount));
    }
  );
});


const getLast6MonthsLeadCountStatus = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const last6MonthsStartDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 6,
    1
  )).format('YYYY-MM-DD');
  const lastMonthEndDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  )).add(1, 'days').format('YYYY-MM-DD');
  let sql = `
      SELECT 
          COUNT(*) AS leadCount
      FROM 
          leads`;
  const queryParams = req.query;
  queryParams["leadInternalStatus-eq"] = "1";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  let sql2 = ` AND createdOn >= ? AND createdOn <= ?`;
  sql += sql2;
  dbConnect.query(
    sql,
    [last6MonthsStartDate, lastMonthEndDate],
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Error in Fetching last 6 months Leads Count");
        return;
      }
      const last6MonthsLeadCountList = result[0].leadCount
      res.status(200).send(String(last6MonthsLeadCountList));
    }
  );
});
const getLast6MonthsCallBacksCount = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const last6MonthsStartDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 6,
    1
  )).format('YYYY-MM-DD');
  const lastMonthEndDate = moment(new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  )).add(1, 'days').format('YYYY-MM-DD');
  let sql = `
      SELECT 
          COUNT(*) AS count
      FROM 
          callbacks`;
  const queryParams = req.query;
  queryParams["callbackInternalStatus-eq"] = "1";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  let sql2 = ` AND createdOn >= ? AND createdOn <= ?`;
  sql += sql2;
  dbConnect.query(
    sql,
    [last6MonthsStartDate, lastMonthEndDate],
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Error in Fetching last 6 months Callback Count");
        return;
      }
      const last6MonthsCallBacksCount = result[0].count;
      res.status(200).send(String(last6MonthsCallBacksCount));
    }
  );
});
const getLastYearLeadCountStatus = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const lastYearStartDate = moment(new Date(
    currentDate.getFullYear() - 1,
    0,
    1
  )).format('YYYY-MM-DD');
  const lastYearEndDate = moment(new Date(currentDate.getFullYear() - 1, 11, 31)).add(1, 'days').format('YYYY-MM-DD');
  let sql = `
  SELECT 
      COUNT(*) AS leadCount
  FROM 
      leads`;
  const queryParams = req.query;
  queryParams["leadInternalStatus-eq"] = "1";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  let sql2 = ` AND createdOn >= ? AND createdOn <= ?`;
  sql += sql2;
  dbConnect.query(sql, [lastYearStartDate, lastYearEndDate], (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Error in Fetching last year Leads Count");
      return;
    }
    const lastYearLeadCount = result[0].leadCount;
    res.status(200).send(String(lastYearLeadCount));
  });
});
const getLastYearCallBacksCount = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const lastYearStartDate = moment(new Date(
    currentDate.getFullYear() - 1,
    0,
    1
  )).format('YYYY-MM-DD');
  const lastYearEndDate = moment(new Date(currentDate.getFullYear() - 1, 11, 31)).add(1, 'days').format('YYYY-MM-DD');
  let sql = `
  SELECT 
      COUNT(*) AS count
  FROM 
      callbacks`;
  const queryParams = req.query;
  queryParams["callbackInternalStatus-eq"] = "1";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  let sql2 = ` AND createdOn >= ? AND createdOn <= ?`;
  sql += sql2;
  dbConnect.query(sql, [lastYearStartDate, lastYearEndDate], (err, result) => {
    if (err) {
      console.error("Error:", err);
      res.status(500).send("Error in Fetching last year Callbacks Count");
      return;
    }
    const lastYearCallBacksCount = result[0].count;
    res.status(200).send(String(lastYearCallBacksCount));
  });
});
const getDisbursedAmount = asyncHandler(async (req, res) => {
  let sql = `SELECT 
    COALESCE(SUM(disbursedAmount), 0) AS totalDisbursedAmount
 FROM logins `;
  const queryParams = req.query;
  queryParams["fipStatus-eq"] = "approved";
  queryParams["approvedStatus-eq"] = "disbursed";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(
    sql,
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      const totalDisbursedAmount = result[0].totalDisbursedAmount;
      res.status(200).send(String(totalDisbursedAmount));
    }
  );
});

const getSanctionedAmount = asyncHandler(async (req, res) => {
  let sql = `SELECT 
  COALESCE(SUM(sanctionedAmount), 0) AS totalSanctionedAmount
 FROM logins`;
  const queryParams = req.query;
  queryParams["fipStatus-eq"] = "approved";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(
    sql,
    (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Error in Fetching Month Wise Sanctioned Amount");
        return;
      }
      const totalSanctionedAmount = result[0].totalSanctionedAmount;
      res.status(200).send(String(totalSanctionedAmount));
    }
  );
});

async function fetchLeadIds(req) {
  const queryParams = req.query;
  const filtersQuery = handleGlobalFilters(queryParams);
  const sql = `SELECT id AS leadId FROM leads ${filtersQuery}`;
  return new Promise((resolve, reject) => {
    dbConnect.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const leadIds = result.map((row) => row.leadId);
      resolve(leadIds);
    });
  });
}
const currentDate = new Date();

const lastMonthStartDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() - 1,
  1
)).format('YYYY-MM-DD');
const lastMonthEndDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  0
)).format('YYYY-MM-DD');

const getuserLastMonthSanctionedAmount = asyncHandler(async (req, res) => {
  try {
    const leadIds = await fetchLeadIds(req);
    if (leadIds.length === 0) {
      return res.status(200).send('0');
    }
    const placeholders = leadIds.map(() => '?').join(',');
    const sql = `
       SELECT 
    COALESCE(SUM(sanctionedAmount), 0) AS totalSanctionedAmount
  FROM logins
  WHERE fipStatus = 'approved'
    AND approvalDate >= ?
    AND approvalDate <= ?
    AND leadId IN (${placeholders})
    `;
    dbConnect.query(
      sql,
      [lastMonthStartDate, lastMonthEndDate, ...leadIds],
      (err, result) => {
        if (err) {
          console.error("Error:", err);
          res.status(500).send("Error in Fetching Sanctioned Amount");
          return;
        }
        const totalSanctionedAmount = result[0].totalSanctionedAmount;
        res.status(200).send(String(totalSanctionedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error In Fetching the Sanctioned Amount");
  }
});

const getuserLastMonthDisbursedAmount = asyncHandler(async (req, res) => {
  try {
    const leadIds = await fetchLeadIds(req);
    if (leadIds.length === 0) {
      return res.status(200).send('0');
    }
    const placeholders = leadIds.map(() => '?').join(',');
    const sql = `
      SELECT 
        COALESCE(SUM(disbursedAmount), 0) AS totalDisbursedAmount
      FROM logins
      WHERE fipStatus = 'approved'
        AND approvedStatus = 'disbursed'
        AND disbursalDate >= ?
        AND disbursalDate <= ?
        AND leadId IN (${placeholders})
    `;
    dbConnect.query(
      sql,
      [lastMonthStartDate, lastMonthEndDate, ...leadIds],
      (err, result) => {
        if (err) {
          console.error("Error:", err);
          res.status(500).send("Error in Fetching Disbursed Amount");
          return;
        }
        const totalDisbursedAmount = result[0].totalDisbursedAmount;
        res.status(200).send(String(totalDisbursedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send(" Error in Fetching Disbursed Amount");
  }
});

const currentMonthStartDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  1
)).format('YYYY-MM-DD');
const currentMonthEndDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() + 1,
  0
)).format('YYYY-MM-DD');

const getuserCurrentMonthSanctionedAmount = asyncHandler(async (req, res) => {
  try {
    const leadIds = await fetchLeadIds(req);
    if (leadIds.length === 0) {
      return res.status(200).send('0');
    }
    const placeholders = leadIds.map(() => '?').join(',');
    const sql = `
       SELECT 
      COALESCE(SUM(sanctionedAmount), 0) AS totalSanctionedAmount
    FROM logins
    WHERE fipStatus = 'approved'
      AND approvalDate >= ?
      AND approvalDate <= ?
      AND leadId IN (${placeholders})
  `;
    // console.log(currentMonthStartDate)
    // console.log(currentMonthEndDate)
    // console.log(sql);
    dbConnect.query(
      sql,
      [currentMonthStartDate, currentMonthEndDate, ...leadIds],
      (err, result) => {
        if (err) {
          console.error("Error:", err);
          res.status(500).send("Error in Fetching Sanctioned Amount");
          return;
        }
        const totalSanctionedAmount = result[0].totalSanctionedAmount;
        res.status(200).send(String(totalSanctionedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error in Fetching Sanctioned Amount");
  }
});

const getuserCurrentMonthDisbursedAmount = asyncHandler(async (req, res) => {
  try {
    const leadIds = await fetchLeadIds(req);
    if (leadIds.length === 0) {
      return res.status(200).send('0');
    }
    const placeholders = leadIds.map(() => '?').join(',');
    const sql = `
      SELECT 
    COALESCE(SUM(disbursedAmount), 0) AS totalDisbursedAmount
  FROM logins
  WHERE fipStatus = 'approved'
        AND approvedStatus = 'disbursed'
        AND disbursalDate >= ?
        AND disbursalDate <= ?
        AND leadId IN (${placeholders})
    `;
    dbConnect.query(
      sql,
      [currentMonthStartDate, currentMonthEndDate, ...leadIds],
      (err, result) => {
        if (err) {
          console.error("Error:", err);
          res.status(500).send("Error in Fetching Disbursed Amount");
          return;
        }
        const totalDisbursedAmount = result[0].totalDisbursedAmount;
        res.status(200).send(String(totalDisbursedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error in Fetching Disbursed Amount");
  }
});


const lastLastMonthStartDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() - 2,
  1
)).format('YYYY-MM-DD');
const lastLastMonthEndDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() - 1,
  0
)).format('YYYY-MM-DD');
const getuserLastLastMonthSanctionedAmount = asyncHandler(async (req, res) => {
  try {
    const leadIds = await fetchLeadIds(req);
    if (leadIds.length === 0) {
      return res.status(200).send('0');
    }
    const placeholders = leadIds.map(() => '?').join(',');
    const sql = `
       SELECT 
      COALESCE(SUM(sanctionedAmount), 0) AS totalSanctionedAmount
    FROM logins
    WHERE fipStatus = 'approved'
      AND approvalDate >= ?
      AND approvalDate <= ?
      AND leadId IN (${placeholders})
  `;
    dbConnect.query(
      sql,
      [lastLastMonthStartDate, lastLastMonthEndDate, ...leadIds],
      (err, result) => {
        if (err) {
          console.error("Error:", err);
          res.status(500).send("Error in Fetching  Sanctioned Amount");
          return;
        }
        const totalSanctionedAmount = result[0].totalSanctionedAmount;
        res.status(200).send(String(totalSanctionedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error in Fetching Sanctioned Amount");
  }
});

const getuserLastLastMonthDisbursedAmount = asyncHandler(async (req, res) => {
  try {
    const leadIds = await fetchLeadIds(req);
    if (leadIds.length === 0) {
      return res.status(200).send('0');
    }
    const placeholders = leadIds.map(() => '?').join(',');
    const sql = `
      SELECT 
      COALESCE(SUM(disbursedAmount), 0) AS totalDisbursedAmount
    FROM logins
    WHERE fipStatus = 'approved'
      AND approvedStatus = 'disbursed'
      AND disbursalDate >= ?
      AND disbursalDate <= ?
      AND leadId IN (${placeholders})
    `;
    dbConnect.query(
      sql,
      [lastLastMonthStartDate, lastLastMonthEndDate, ...leadIds],
      (err, result) => {
        if (err) {
          console.error("Error:", err);
          res.status(500).send("Error in Fetching Disbursed Amount");
          return;
        }
        const totalDisbursedAmount = result[0].totalDisbursedAmount;
        res.status(200).send(String(totalDisbursedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error in Fetching Disbursed Amount");
  }
});


const twoMonthsAgoStartDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() - 3,
  1
)).format('YYYY-MM-DD');
const twoMonthsEgoEndDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() - 2,
  0
)).format('YYYY-MM-DD');

const getuserTwoMonthsAgoSanctionedAmount = asyncHandler(async (req, res) => {
  try {
    const leadIds = await fetchLeadIds(req);
    if (leadIds.length === 0) {
      return res.status(200).send('0');
    }
    const placeholders = leadIds.map(() => '?').join(',');
    const sql = `
       SELECT 
      COALESCE(SUM(sanctionedAmount), 0) AS totalSanctionedAmount
    FROM logins
    WHERE fipStatus = 'approved'
      AND approvalDate >= ?
      AND approvalDate <= ?
      AND leadId IN (${placeholders})
  `;
    dbConnect.query(
      sql,
      [twoMonthsAgoStartDate, twoMonthsEgoEndDate, ...leadIds],
      (err, result) => {
        if (err) {
          console.error("Error:", err);
          res.status(500).send("Error in Fetching Sanctioned Amount");
          return;
        }
        const totalSanctionedAmount = result[0].totalSanctionedAmount;
        res.status(200).send(String(totalSanctionedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error in Fetching Sanctioned Amount");
  }
});

const getuserTwoMonthsAgoDisbursedAmount = asyncHandler(async (req, res) => {
  try {
    const leadIds = await fetchLeadIds(req);
    if (leadIds.length === 0) {
      return res.status(200).send('0');
    }
    const placeholders = leadIds.map(() => '?').join(',');
    const sql = `
      SELECT 
      COALESCE(SUM(disbursedAmount), 0) AS totalDisbursedAmount
    FROM logins
    WHERE fipStatus = 'approved'
      AND approvedStatus = 'disbursed'
      AND disbursalDate >= ?
      AND disbursalDate <= ?
      AND leadId IN (${placeholders})
    `;
    dbConnect.query(
      sql,
      [twoMonthsAgoStartDate, twoMonthsEgoEndDate, ...leadIds],
      (err, result) => {
        if (err) {
          console.error("Error:", err);
          res.status(500).send("Error in Fetching Disbursed Amount");
          return;
        }
        const totalDisbursedAmount = result[0].totalDisbursedAmount;
        res.status(200).send(String(totalDisbursedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error in Fetching Disbursed Amount");
  }
});
module.exports = {
  getLeadCountStatus,
  getFilesCountStatus,
  // getPartialCountStatus,
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
  getCallbackCountStatus,
  getRejectedCountStatus,
  getLoginsCountStatus,
  getDisbursedAmount,
  getSanctionedAmount,
  getLastBeforeMonthLeadCountStatus,
  getThisMonthLeadCountStatus,
  getTwoMonthsAgoCallBacksCount,
  getThisMonthCallBacksCount,
  getuserLastMonthSanctionedAmount,
  getuserLastMonthDisbursedAmount,
  getuserCurrentMonthSanctionedAmount,
  getuserCurrentMonthDisbursedAmount,
  getuserLastLastMonthDisbursedAmount,
  getuserLastLastMonthSanctionedAmount,
  getuserTwoMonthsAgoSanctionedAmount,
  getuserTwoMonthsAgoDisbursedAmount
};
