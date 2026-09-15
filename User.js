const { getCollection } = require('../config/db');

const User = getCollection('users');

module.exports = User;
