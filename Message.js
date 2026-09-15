const { getCollection } = require('../config/db');

const Message = getCollection('messages');

module.exports = Message;
