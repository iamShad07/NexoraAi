const { getCollection } = require('../config/db');

const Export = getCollection('exports');

module.exports = Export;
