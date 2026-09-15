const { getCollection } = require('../config/db');

const Document = getCollection('documents');

module.exports = Document;
