module.exports = (sequelize, Sequelize) => {
  const loginInfo = sequelize.define("loginInfo", {
    memberId: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    ipAddress: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    accessTime: {
      type: Sequelize.DATE,
      primaryKey: true
    }
  });
  return loginInfo;
}
