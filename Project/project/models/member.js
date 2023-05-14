module.exports = (sequelize, Sequelize) => {
  const member = sequelize.define("member", {
    memberId: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    fullName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    nickname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    phone: {
      type: Sequelize.STRING
    },
    createdAt: {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn("NOW") 
   },
   updatedAt: {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn("NOW")
   }
  });
  return member;
}
