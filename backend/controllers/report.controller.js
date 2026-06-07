const db = require('../config/db');

const getReports = (req, res) => {

  const requestStatusSql = `SELECT status, COUNT(*) as count FROM meeting_requests GROUP BY status`;
  const taskStatusSql = `SELECT status, COUNT(*) as count FROM tasks GROUP BY status`;
  const visitorStatusSql = `SELECT approval_status, COUNT(*) as count FROM visitors GROUP BY approval_status`;
  const totalsSql = `
    SELECT 
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM meeting_requests) as total_requests,
      (SELECT COUNT(*) FROM tasks) as total_tasks,
      (SELECT COUNT(*) FROM visitors) as total_visitors,
      (SELECT COUNT(*) FROM events) as total_events,
      (SELECT COUNT(*) FROM documents) as total_documents
  `;
  const meetingsPerDaySql = `
    SELECT DATE(start_time) as date, COUNT(*) as count 
    FROM events 
    WHERE start_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DATE(start_time)
    ORDER BY date ASC
  `;
  const requestsByDeptSql = `
    SELECT department, COUNT(*) as count 
    FROM meeting_requests 
    WHERE department IS NOT NULL AND department != ''
    GROUP BY department 
    ORDER BY count DESC
    LIMIT 8
  `;
  const timeUtilizationSql = `
    SELECT 
      HOUR(start_time) as hour,
      COUNT(*) as count
    FROM events
    GROUP BY HOUR(start_time)
    ORDER BY hour ASC
  `;
  const tasksByPrioritySql = `
    SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority
  `;

  db.query(requestStatusSql, (err, requestStatus) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    
    db.query(taskStatusSql, (err2, taskStatus) => {
      if (err2) return res.json({ success: false, message: err2.message, data: null });
      
      db.query(visitorStatusSql, (err3, visitorStatus) => {
        if (err3) return res.json({ success: false, message: err3.message, data: null });
        
        db.query(totalsSql, (err4, totals) => {
          if (err4) return res.json({ success: false, message: err4.message, data: null });
          
          db.query(meetingsPerDaySql, (err5, meetingsPerDay) => {
            if (err5) return res.json({ success: false, message: err5.message, data: null });

            db.query(requestsByDeptSql, (err6, requestsByDept) => {
              if (err6) return res.json({ success: false, message: err6.message, data: null });

              db.query(timeUtilizationSql, (err7, timeUtilization) => {
                if (err7) return res.json({ success: false, message: err7.message, data: null });

                db.query(tasksByPrioritySql, (err8, tasksByPriority) => {
                  if (err8) return res.json({ success: false, message: err8.message, data: null });

                  res.json({
                    success: true,
                    message: 'Reports fetched',
                    data: {
                      totals: totals[0],
                      requestStatus,
                      taskStatus,
                      visitorStatus,
                      meetingsPerDay,
                      requestsByDept,
                      timeUtilization,
                      tasksByPriority
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

module.exports = { getReports };