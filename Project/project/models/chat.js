module.exports = (sequelize, Sequelize) => {
  const chat = sequelize.define("chat", {
    chatRoomNo: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    chatNo: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    chatContent: {
      type: Sequelize.STRING
    },
    time: {
      type: Sequelize.DATE
    }
  });
  return chat; 
}
