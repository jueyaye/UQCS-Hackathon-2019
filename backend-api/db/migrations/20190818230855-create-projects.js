'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('projects', {
      // general
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      owner: {
        type: Sequelize.UUID
      },
      members: {
        type: Sequelize.JSONB
      },
      rules: {
        type: Sequelize.JSONB
      },
      // credentials => stringify => hash actual credentials object
      trelloCredentials: {
        type: Sequelize.STRING
      },
      trelloDetails: {
        type: Sequelize.JSONB
      },
      githubCredentials: {
        type: Sequelize.STRING
      },
      githubDetails: {
        type: Sequelize.JSONB
      },
      slackDetails: {
        type: Sequelize.JSONB
      },
      slackCredentials: {
        type: Sequelize.STRING
      },
      // logging
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('projects');
  }
};