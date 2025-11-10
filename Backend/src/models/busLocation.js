const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Bus = require("./bus");

const BusLocation = sequelize.define(
  "BusLocation",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bus_id: { type: DataTypes.INTEGER, allowNull: false },
    latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
    longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "BusLocations",
    timestamps: false,
  }
);

BusLocation.belongsTo(Bus, { foreignKey: "bus_id" });
Bus.hasMany(BusLocation, { foreignKey: "bus_id" });

module.exports = BusLocation;
