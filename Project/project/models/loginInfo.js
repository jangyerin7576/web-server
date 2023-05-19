module.exports = (sequelize, Sequelize) => {
  const loginInfo = sequelize.define("loginInfo", {
    ipAddress: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    accessTime: {
      type: Sequelize.DATE,
      primaryKey: true,
      defaultValue: Sequelize.NOW
    }
  },
  {
    timestamps: false
  });
  return loginInfo;
}
