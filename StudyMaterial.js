const { getCollection } = require('../config/db');

const StudyMaterial = getCollection('studymaterials');

module.exports = StudyMaterial;
