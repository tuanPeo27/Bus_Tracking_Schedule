const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");
const Route = require("./route");
const BusStop = require("./busStop");

const Student = sequelize.define("Student", {
  name: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER },
  school: { type: DataTypes.STRING },
  pickup_point_id: { type: DataTypes.INTEGER },
  dropoff_point_id: { type: DataTypes.INTEGER },
});

Student.belongsTo(User, { as: "parent", foreignKey: "parent_id" });
User.hasMany(Student, { as: "children", foreignKey: "parent_id" });

Student.belongsTo(Route, { foreignKey: "route_id" });
Route.hasMany(Student, { foreignKey: "route_id" });

Student.belongsTo(BusStop, {
  as: "pickup_point",
  foreignKey: "pickup_point_id",
  onUpdate: "CASCADE",
  onDelete: "SET NULL",
});
BusStop.hasMany(Student, {
  as: "pickup_students",
  foreignKey: "pickup_point_id",
});

Student.belongsTo(BusStop, {
  as: "dropoff_point",
  foreignKey: "dropoff_point_id",
  onUpdate: "CASCADE",
  onDelete: "SET NULL",
});
BusStop.hasMany(Student, {
  as: "dropoff_students",
  foreignKey: "dropoff_point_id",
});

module.exports = Student;
