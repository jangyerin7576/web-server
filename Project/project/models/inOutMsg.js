module.exports = (sequelize, Sequelize) => {
  const inOutMsg = sequelize.define("inOutMsg", {
    timestamps: false
  }); 
  return inOutMsg;
}
