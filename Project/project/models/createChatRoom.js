module.exports = (sequelize, Sequelize) => {
  const createChatRoom = sequelize.define("createChatRoom", {
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
  },
  {
    timestamps: false
  });
  return createChatRoom; 
}
