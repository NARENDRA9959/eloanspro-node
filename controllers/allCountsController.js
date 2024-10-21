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
  `;
  const queryParams = req.query;
  queryParams["leadInternalStatus-eq"] = "3";
  const filtersQuery = handleGlobalFilters(queryParams);
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
`;
  const queryParams = req.query;
  queryParams["leadInternalStatus-eq"] = "11";
  const filtersQuery = handleGlobalFilters(queryParams);
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
  `;
  const queryParams = req.query;
  queryParams["leadInternalStatus-eq"] = "4";
  const filtersQuery = handleGlobalFilters(queryParams);
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
      res.status(500).send("Internal Server Error");
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
      res.status(500).send("Internal Server Error");
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
      res.status(500).send("Internal Server Error");
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
      res.status(500).send("Internal Server Error");
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
  )).format('YYYY-MM-DD');
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
        res.status(500).send("Internal Server Error");
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
        res.status(500).send("Internal Server Error");
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
  )).format('YYYY-MM-DD');
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
        res.status(500).send("Internal Server Error");
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
  )).format('YYYY-MM-DD');
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
        res.status(500).send("Internal Server Error");
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
        res.status(500).send("Internal Server Error");
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
  )).format('YYYY-MM-DD');
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
        res.status(500).send("Internal Server Error");
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
  )).format('YYYY-MM-DD');
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
        res.status(500).send("Internal Server Error");
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
  )).format('YYYY-MM-DD');
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
        res.status(500).send("Internal Server Error");
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
  const lastYearEndDate = moment(new Date(currentDate.getFullYear() - 1, 11, 31)).format('YYYY-MM-DD');
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
      res.status(500).send("Internal Server Error");
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
  const lastYearEndDate = moment(new Date(currentDate.getFullYear() - 1, 11, 31)).format('YYYY-MM-DD');
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
      res.status(500).send("Internal Server Error");
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
        res.status(500).send("Internal Server Error");
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
)).format('MM/DD/YYYY');
const lastMonthEndDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  0
)).format('MM/DD/YYYY');

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
          res.status(500).send("Internal Server Error");
          return;
        }
        const totalSanctionedAmount = result[0].totalSanctionedAmount;
        res.status(200).send(String(totalSanctionedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
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
          res.status(500).send("Internal Server Error");
          return;
        }
        const totalDisbursedAmount = result[0].totalDisbursedAmount;
        res.status(200).send(String(totalDisbursedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
const currentMonthStartDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  1
)).format('MM/DD/YYYY');
const currentMonthEndDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() + 1,
  0
)).format('MM/DD/YYYY');

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
    dbConnect.query(
      sql,
      [currentMonthStartDate, currentMonthEndDate, ...leadIds],
      (err, result) => {
        if (err) {
          console.error("Error:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        const totalSanctionedAmount = result[0].totalSanctionedAmount;
        res.status(200).send(String(totalSanctionedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
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
          res.status(500).send("Internal Server Error");
          return;
        }
        const totalDisbursedAmount = result[0].totalDisbursedAmount;
        res.status(200).send(String(totalDisbursedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

const lastLastMonthStartDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() - 2,
  1
)).format('MM/DD/YYYY');
const lastLastMonthEndDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() - 1,
  0
)).format('MM/DD/YYYY');

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
          res.status(500).send("Internal Server Error");
          return;
        }
        const totalSanctionedAmount = result[0].totalSanctionedAmount;
        res.status(200).send(String(totalSanctionedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
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
          res.status(500).send("Internal Server Error");
          return;
        }
        const totalDisbursedAmount = result[0].totalDisbursedAmount;
        res.status(200).send(String(totalDisbursedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});


const twoMonthsAgoStartDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() - 3,
  1
)).format('MM/DD/YYYY');
const twoMonthsEgoEndDate = moment(new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() - 2,
  0
)).format('MM/DD/YYYY');

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
          res.status(500).send("Internal Server Error");
          return;
        }
        const totalSanctionedAmount = result[0].totalSanctionedAmount;
        res.status(200).send(String(totalSanctionedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
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
          res.status(500).send("Internal Server Error");
          return;
        }
        const totalDisbursedAmount = result[0].totalDisbursedAmount;
        res.status(200).send(String(totalDisbursedAmount));
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
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
