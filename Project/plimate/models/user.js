module.exports = (sequelize, Sequelize) => {
  const user = sequelize.define("user", {
    linkedAccount: {
      type: Sequelize.STRING,
      primaryKey: true
    }
  },
  {
    timestamps: false
  });
  return user;
}
