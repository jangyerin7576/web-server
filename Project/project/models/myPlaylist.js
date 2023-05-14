module.exports = (sequelize, Sequelize) => {
  const myPlaylist = sequelize.define("myPlaylist", {
    memberId: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    myPlaylistNo: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    createdDate: {
      type: Sequelize.DATE
    }
  });
  return myPlaylist;
}
