'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ModelAi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ModelAi.hasMany(models.ChatGroup, {
        foreignKey: 'modelai_id',
        as: 'modelai',
        onDelete: 'CASCADE',
        hooks: true, // ✅ จำเป็นถ้าใช้ paranoid
      });
    }
  }
  ModelAi.init({
    name: DataTypes.STRING,
    tokenCount: DataTypes.INTEGER
  }, {
    sequelize,
    freezeTableName: true,
    timestamps: true, // ต้องเปิด timestamps ด้วย
    modelName: 'ModelAi',
    tableName: 'modelai'
  });
  return ModelAi;
};