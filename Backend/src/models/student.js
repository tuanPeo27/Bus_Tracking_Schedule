const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");
const Route = require("./route");

const Student = sequelize.define("Student", {
  name: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER },
  pickup_point: { type: DataTypes.STRING },
  dropoff_point: { type: DataTypes.STRING },
});

Student.belongsTo(User, { as: "parent", foreignKey: "parent_id" });
User.hasMany(Student, { as: "children", foreignKey: "parent_id" });

Student.belongsTo(Route, { foreignKey: "route_id" });
Route.hasMany(Student, { foreignKey: "route_id" });

module.exports = Student;
