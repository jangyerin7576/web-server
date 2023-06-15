module.exports = (sequelize, Sequelize) => {
  const myPlaylist = sequelize.define("myPlaylist", {
    myPlaylistNo: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    createdDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  },
  {
    timestamps: false
  });
  return myPlaylist;
}
