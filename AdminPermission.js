const { getCollection } = require('../config/db');

const AdminPermission = getCollection('adminpermissions');

module.exports = AdminPermission;
