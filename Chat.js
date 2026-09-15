const { getCollection } = require('../config/db');

const Chat = getCollection('chats');

module.exports = Chat;
