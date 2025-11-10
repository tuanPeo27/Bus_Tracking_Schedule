const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Bus = require("./bus");
const Route = require("./route");
const User = require("./user");

const Schedule = sequelize.define("Schedule", {
  date: { type: DataTypes.DATEONLY, allowNull: false },
  status: {
    type: DataTypes.ENUM("scheduled", "in_progress", "completed", "cancelled"),
    defaultValue: "scheduled",
  },
  start_time: { type: DataTypes.TIME },
  end_time: { type: DataTypes.TIME },
});

Schedule.belongsTo(Route, { foreignKey: "route_id" });
Schedule.belongsTo(Bus, { foreignKey: "bus_id" });
Schedule.belongsTo(User, { as: "driver", foreignKey: "driver_id" });

Route.hasMany(Schedule, { foreignKey: "route_id" });
Bus.hasMany(Schedule, { foreignKey: "bus_id" });
User.hasMany(Schedule, { as: "drivingSchedules", foreignKey: "driver_id" });

module.exports = Schedule;
