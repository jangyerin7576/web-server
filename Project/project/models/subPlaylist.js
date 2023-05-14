module.exports = (sequelize, Sequelize) => {
  const subPlaylist = sequelize.define("subPlaylist", {
    chatRoomNo: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    subPlaylistNo: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    createdDate: {
      type: Sequelize.DATE
    },
    myPlaylistNo: {
      type: Sequelize.INTEGER
    }
  });
  return subPlaylist;
}
