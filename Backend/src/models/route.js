const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Route = sequelize.define(
  "Route",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    start_point: { type: DataTypes.STRING, allowNull: false },
    end_point: { type: DataTypes.STRING, allowNull: false },
  },
  {
    timestamps: true,
  }
);

module.exports = Route;
