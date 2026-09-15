const ActivityLog = require('../models/ActivityLog');

const logActivity = (userId, action, status = 'SUCCESS', metadata = {}, ip = '') => {
  try {
    ActivityLog.create({
      userId: userId || 'anonymous',
      action,
      status,
      metadata,
      ip,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
};

module.exports = {
  logActivity
};
