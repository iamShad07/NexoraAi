const { getCollection } = require('../config/db');

const Analysis = getCollection('analyses');

module.exports = Analysis;
