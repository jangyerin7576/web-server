module.exports = (sequelize, Sequelize) => {
  const subPlaylist = sequelize.define("subPlaylist", {
    subPlaylistNo: {
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
  return subPlaylist;
}
