module.exports = (sequelize, Sequelize) => {
  const follow = sequelize.define("follow", {
    memberId1: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    memberId2: {
      type: Sequelize.STRING,
      primaryKey: true
    }
  },
  {
    timestamps: false
  });
  return follow;
}
