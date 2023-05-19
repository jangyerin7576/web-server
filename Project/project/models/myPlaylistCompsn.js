module.exports = (sequelize, Sequelize) => {
  const myPlaylistCompsn = sequelize.define("myPlaylistCompsn", {
    orderNo: {
      type: Sequelize.INTEGER
    }
  },
  {
    timestamps: false
  });
  return myPlaylistCompsn; 
}
