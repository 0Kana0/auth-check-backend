'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ChatGroup.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      ChatGroup.belongsTo(models.ModelAi, { foreignKey: 'modelai_id', as: 'modelai' });
    }
  }
  ChatGroup.init({
    name: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    modelai_id: DataTypes.INTEGER
  }, {
    sequelize,
    freezeTableName: true,
    timestamps: true, // ต้องเปิด timestamps ด้วย
    modelName: 'ChatGroup',
    tableName: 'chatgroup'
  });
  return ChatGroup;
};