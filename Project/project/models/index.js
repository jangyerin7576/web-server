'use strict';

const fs = require('fs');
const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize = new Sequelize(config.database, config.username, config.passwd, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.member = require("./member.js")(sequelize, Sequelize);
db.user = require("./user.js")(sequelize, Sequelize);
db.myPlaylist = require("./myPlaylist.js")(sequelize, Sequelize);
db.subPlaylist = require("./subPlaylist.js")(sequelize, Sequelize);
db.music = require("./music.js")(sequelize, Sequelize);
db.loginInfo = require("./loginInfo.js")(sequelize, Sequelize);
db.message = require("./message.js")(sequelize, Sequelize);
db.chatRoom = require("./chatRoom.js")(sequelize, Sequelize);
db.chat = require("./chat.js")(sequelize, Sequelize);
db.createChatRoom = require("./createChatRoom.js")(sequelize, Sequelize);
db.follow = require("./follow.js")(sequelize, Sequelize);
db.inOutMsg = require("./inOutMsg.js")(sequelize, Sequelize);
db.myPlaylistCompsn = require("./myPlaylistCompsn.js")(sequelize, Sequelize);
db.subPlaylistCompsn = require("./subPlaylistCompsn.js")(sequelize, Sequelize);
db.chatRoomInvt = require("./chatRoomInvt.js")(sequelize, Sequelize);

module.exports = db;
