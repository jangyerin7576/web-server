module.exports = (sequelize, Sequelize) => {
  const chat = sequelize.define("chat", {
    chatNo: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    chatContent: {
      type: Sequelize.STRING
    },
    time: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  },
  {
    timestamps: false
  }
  );
  return chat; 
}
