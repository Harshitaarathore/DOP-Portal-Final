const cron = require('node-cron');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createNotification = (user_id, message, type) => {
  const id = uuidv4();
  const sql = `INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)`;
  db.query(sql, [id, user_id, message, type], (err) => {
    if (err) console.log('Notification error:', err.message);
  });
};

// Run every hour
const startScheduler = () => {

  // Check upcoming meetings — runs every hour
  cron.schedule('0 * * * *', () => {
    console.log('Running meeting reminder check...');

    const sql = `
      SELECT e.*, u.id as user_id 
      FROM events e
      JOIN users u ON u.role IN ('Director', 'Secretary')
      WHERE e.start_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 HOUR)
    `;

    db.query(sql, (err, events) => {
      if (err) return console.log('Scheduler error:', err.message);
      events.forEach(ev => {
        createNotification(
          ev.user_id,
          `Reminder: "${ev.title}" starts in less than 1 hour`,
          'meeting_reminder'
        );
      });
    });
  });

  // Check task deadlines — runs every day at 8 AM
  cron.schedule('0 8 * * *', () => {
    console.log('Running task deadline check...');

    const sql = `
      SELECT t.*, u.id as user_id
      FROM tasks t
      JOIN users u ON u.id = t.assigned_to
      WHERE t.deadline = CURDATE() AND t.status != 'Completed'
    `;

    db.query(sql, (err, tasks) => {
      if (err) return console.log('Task scheduler error:', err.message);
      tasks.forEach(task => {
        createNotification(
          task.user_id,
          `Task deadline today: "${task.title}"`,
          'task_deadline'
        );
      });
    });
  });

  // Check overdue tasks — runs every day at 9 AM
  cron.schedule('0 9 * * *', () => {
    console.log('Running overdue task check...');

    const sql = `
      SELECT t.*, u.id as user_id
      FROM tasks t
      JOIN users u ON u.id = t.assigned_to
      WHERE t.deadline < CURDATE() AND t.status != 'Completed'
    `;

    db.query(sql, (err, tasks) => {
      if (err) return console.log('Overdue task error:', err.message);
      tasks.forEach(task => {
        createNotification(
          task.user_id,
          `Overdue task: "${task.title}" was due on ${new Date(task.deadline).toLocaleDateString()}`,
          'task_overdue'
        );
      });
    });
  });

  console.log('Scheduler started');
};

module.exports = { startScheduler };