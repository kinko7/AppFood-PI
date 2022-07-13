const { DataTypes } = require("sequelize");
const { DatabaseError } = require("pg");
const { uuidv4 } = require("uuid");

module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define(
    "Recipe",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      healthScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      spoonacularScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      steps: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      dishTypes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      steps: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      steps: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // createDb: {
      //   type: DataTypes.BOOLEAN,
      //   allowNull: false,
      //   defaultValue: true
      // },
    },
    {
      timestamps: false,
    }
  );
};
