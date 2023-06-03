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

//memeber, user > 1:N
db.member.hasMany(db.user, {
  foreignKey: {
    name: 'memberId',
    primaryKey: true
  },
  sourceKey: 'memberId'
});
db.user.belongsTo(db.member, {
  foreignKey: {
    name: 'memberId',
    primaryKey: true
  },
  targetKey: 'memberId'
});
//member, myPlaylist > 1:N
db.member.hasMany(db.myPlaylist, {
  foreignKey: {
    name: 'memberId',
    primaryKey: true
  },
  sourceKey: 'memberId'
});
db.myPlaylist.belongsTo(db.member, {
  foreignKey: {
    name: 'memberId',
    primaryKey: true
  },
  targetKey: 'memberId'
});
//subPlaylist, chatRoom > 1:1
db.chatRoom.hasOne(db.subPlaylist, {
  foreignKey: {
    name: 'chatRoomNo',
    primaryKey: true
  },
  sourceKey: 'chatRoomNo'
});
db.subPlaylist.belongsTo(db.chatRoom, {
  foreignKey: {
    name: 'chatRoomNo',
    primaryKey: true
  },
  targetKey: 'chatRoomNo'
});
//subPlaylist, myPlaylist > N:1
db.myPlaylist.hasMany(db.subPlaylist, {
  foreignKey: {
    name: 'myPlaylistNo'
  },
  sourceKey: 'myPlaylistNo'
});
db.subPlaylist.belongsTo(db.myPlaylist, {
  foreignKey: {
    name: 'myPlaylistNo'
  },
  targetKey: 'myPlaylistNo'
});
//loginInfo, member > N:1
db.member.hasMany(db.loginInfo, {
  foreignKey: {
    name: 'memberId',
    primaryKey: true
  },
  sourceKey: 'memberId'
});
db.loginInfo.belongsTo(db.member, {
  foreignKey: {
    name: 'memberId',
    primaryKey: true
  },
  targetKey: 'memberId'
});
//chatRoom, chat > 1:N
db.chatRoom.hasMany(db.chat, {
  foreignKey: {
    name: 'chatRoomNo',
    primaryKey: true
  },
  sourceKey: 'chatRoomNo'
});
db.chat.belongsTo(db.chatRoom, {
  foreignKey: {
    name: 'chatRoomNo',
    primaryKey: true
  },
  targetKey: 'chatRoomNo'
});
//createChatRoom, member > 1:1
db.member.hasOne(db.createChatRoom, {
  foreignKey: {
    name: 'memberId',
    primaryKey: true
  },
  sourceKey: 'memberId'
});
db.createChatRoom.belongsTo(db.member, {
  foreignKey: {
    name: 'memberId',
    primaryKey: true
  },
  targetKey: 'memberId'
});
//createChatRoom, chatRoom > 1:1
db.chatRoom.hasOne(db.createChatRoom, {
  foreignKey: {
    name: 'chatRoomNo',
    primaryKey: true
  },
  sourceKey: 'chatRoomNo'
});
db.createChatRoom.belongsTo(db.chatRoom, {
  foreignKey: {
    name: 'chatRoomNo',
    primaryKey: true
  },
  targetKey: 'chatRoomNo'
});
//member, inOutMsg > 1:N
db.member.hasMany(db.inOutMsg, {
  foreignKey: {
    name: 'memberId',
    primaryKey: true
  },
  sourceKey: 'memberId'
});
db.inOutMsg.belongsTo(db.member, {
  foreignKey: {
    name: 'memberId',
    primaryKey: true
  },
  targetKey: 'memberId'
});
//inOutMsg, message > 1:1
db.message.hasOne(db.inOutMsg, {
  foreignKey: {
    name: 'messageNo',
    primaryKey: true
  },
  sourceKey: 'messageNo'
});
db.inOutMsg.belongsTo(db.message, {
  foreignKey: {
    name: 'messageNo',
    primaryKey: true
  },
  targetKey: 'messageNo'
});
//subPlaylistCompsn, subPlaylist > N:1
db.subPlaylist.hasMany(db.subPlaylistCompsn, {
  foreignKey: {
    name: 'subPlaylistNo',
    primaryKey: true
  },
  sourceKey: 'subPlaylistNo'
});
db.subPlaylistCompsn.belongsTo(db.subPlaylist, {
  foreignKey: {
    name: 'subPlaylistNo',
    primaryKey: true
  },
  targetKey: 'subPlaylistNo'
});
//subPlaylistCompsn, music > 1:1
db.music.hasOne(db.subPlaylistCompsn, {
  foreignKey: {
    name: 'musicNo',
    primaryKey: true
  },
  sourceKey: 'musicNo'
});
db.subPlaylistCompsn.belongsTo(db.music, {
  foreignKey: {
    name: 'musicNo',
    primaryKey: true
  },
  targetKey: 'musicNo'
});
//myPlaylistCompsn, myPlaylist > N:1
db.myPlaylist.hasMany(db.myPlaylistCompsn, {
  foreignKey: {
    name: 'myPlaylistNo',
    primaryKey: true
  },
  sourceKey: 'myPlaylistNo'
});
db.myPlaylistCompsn.belongsTo(db.myPlaylist, {
  foreignKey: {
    name: 'myPlaylistNo',
    primaryKey: true
  },
  targetKey: 'myPlaylistNo'
});
//myPlaylistCompsn, music > 1:1
db.music.hasOne(db.myPlaylistCompsn, {
  foreignKey: {
    name: 'musicNo',
    primaryKey: true
  },
  sourceKey: 'musicNo'
});
db.myPlaylistCompsn.belongsTo(db.music, {
  foreignKey: {
    name: 'musicNo',
    primaryKey: true
  },
  targetKey: 'musicNo'
});
//chatRoomInvt, member > 1:1
db.member.hasOne(db.chatRoomInvt, {
  foreignKey: {
    name: 'memberId',
    primaryKey: true
  },
  sourceKey: 'memberId'
});
db.chatRoomInvt.belongsTo(db.member, {
  foreignKey: {
    name: 'memberId',
    primaryKey: true
  },
  targetKey: 'memberId'
});
//chatRoomInvt, chatRoom > N:1
db.chatRoom.hasMany(db.chatRoomInvt, {
  foreignKey: {
    name: 'chatRoomNo',
    primaryKey: true
  },
  sourceKey: 'chatRoomNo'
});
db.chatRoomInvt.belongsTo(db.chatRoom, {
  foreignKey: {
    name: 'chatRoonNo',
    primaryKey: true
  },
  targetKey: 'chatRoomNo'
});
//팔로우랑 회원 관계 >  ????????????????

module.exports = db;
