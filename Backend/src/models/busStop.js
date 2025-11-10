const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Route = require("./route");

const BusStop = sequelize.define(
  "BusStop",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    route_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
    longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
    order_index: { type: DataTypes.INTEGER, allowNull: false },
    estimated_time: { type: DataTypes.TIME },
    actual_time: { type: DataTypes.DATE },
    status: {
      type: DataTypes.ENUM("pending", "arrived", "skipped"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "bus_stops",
    timestamps: true,
  }
);

BusStop.belongsTo(Route, { foreignKey: "route_id" });
Route.hasMany(BusStop, { foreignKey: "route_id" });

module.exports = BusStop;
