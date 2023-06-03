module.exports = (sequelize, Sequelize) => {
  const chatRoom = sequelize.define("chatRoom", {
    chatRoomNo: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    chatRoomName: {
      type: Sequelize.STRING
    },
    createdDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    hostNickname: {
      type: Sequelize.STRING
    }
  },
  {
    timestamps: false
  });
  return chatRoom; 
}
