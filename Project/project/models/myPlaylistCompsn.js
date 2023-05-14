module.exports = (sequelize, Sequelize) => {
  const myPlaylistCompsn = sequelize.define("myPlaylistCompsn", {
    myPlaylistNo: {
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
  return myPlaylistCompsn; 
}
