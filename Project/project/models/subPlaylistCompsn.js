module.exports = (sequelize, Sequelize) => {
  const subPlaylistCompsn = sequelize.define("subPlaylistCompsn", {
    orderNo: {
      type: Sequelize.INTEGER
    }
  }, 
  {
    timestamps: false
  });
  return subPlaylistCompsn; 
}
