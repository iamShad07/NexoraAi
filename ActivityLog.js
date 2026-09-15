const { getCollection } = require('../config/db');

const ActivityLog = getCollection('activitylogs');

module.exports = ActivityLog;
