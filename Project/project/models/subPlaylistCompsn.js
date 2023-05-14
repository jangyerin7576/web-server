module.exports = (sequelize, Sequelize) => {
  const subPlaylistCompsn = sequelize.define("subPlaylistCompsn", {
    subPlaylistNo: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    musicNo: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    orderNo: {
      type: Sequelize.INTEGER
    }
  });
  return subPlaylistCompsn; 
}
