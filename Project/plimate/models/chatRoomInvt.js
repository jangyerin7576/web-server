module.exports = (sequelize, Sequelize) => {
  const chatRoomInvt = sequelize.define("chatRoomInvt", {
    timestamps: false
  });
  return chatRoomInvt;
}
