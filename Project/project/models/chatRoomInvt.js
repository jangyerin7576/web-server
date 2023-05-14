module.exports = (sequelize, Sequelize) => {
  const chatRoomInvt = sequelize.define("chatRoomInvt", {
    memberId: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    chatRoomNo: {
      type: Sequelize.INTEGER,
      primaryKey: true
    }
  });
  return chatRoomInvt;
}
