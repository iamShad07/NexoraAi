const { getCollection } = require('../config/db');

const MindMap = getCollection('mindmaps');

module.exports = MindMap;
