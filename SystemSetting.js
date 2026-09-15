const { getCollection } = require('../config/db');

const SystemSetting = getCollection('systemsettings');

module.exports = SystemSetting;
