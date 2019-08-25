module.exports = (sequelize, DataTypes) => {
  const projects = sequelize.define(
    "projects",
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      owner: DataTypes.UUID,
      members: DataTypes.JSONB,
      rules: DataTypes.JSONB,
      trelloCredentials: DataTypes.STRING,
      trelloDetails: DataTypes.JSONB,
      githubCredentials: DataTypes.STRING,
      githubDetails: DataTypes.JSONB,
      slackDetails: DataTypes.JSONB,
      slackCredentials: DataTypes.STRING
    },
    {}
  );
  projects.associate = function() {
    // associations can be defined here
  };
  return projects;
};
