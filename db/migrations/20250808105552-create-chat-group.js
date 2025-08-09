'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chatgroup', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user', // ชื่อ table ใน DB
          key: 'id'
        },
        onDelete: 'CASCADE', // ✅ สำคัญ!
      },
      modelai_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'modelai', // ชื่อ table ใน DB
          key: 'id'
        },
        onDelete: 'CASCADE', // ✅ สำคัญ!
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('chatgroup');
  }
};