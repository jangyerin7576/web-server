module.exports = (sequelize, Sequelize) => {
  const music = sequelize.define("music", {
    musicNo: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    musicName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    singerName: {
      type: Sequelize.STRING
    },
    releaseDate: {
      type: Sequelize.DATE
    }
  },
  {
    timestamps: false
  });
  return music;
}
