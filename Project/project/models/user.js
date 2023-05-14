module.exports = (sequelize, Sequelize) => {
  const user = sequelize.define("user", {
    memberId: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    linkedAccount: {
      type: Sequelize.STRING,
      primaryKey: true
    }
  });
  return user;
}
