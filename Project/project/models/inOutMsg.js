module.exports = (sequelize, Sequelize) => {
  const inOutMsg = sequelize.define("inOutMsg", {
    memberId: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    messageNo: {
      type: Sequelize.STRING,
      primaryKey: true
    }
  });
  return inOutMsg;
}
