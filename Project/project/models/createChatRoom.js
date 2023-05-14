module.exports = (sequelize, Sequelize) => {
  const createChatRoom = sequelize.define("createChatRoom", {
    memberId: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    chatRoomNo: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    authorize: {
      type: Sequelize.STRING
    },
    maxQueue: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    maxSongLg: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });
  return createChatRoom; 
}
