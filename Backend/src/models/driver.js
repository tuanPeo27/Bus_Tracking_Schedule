const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Driver = sequelize.define("Driver", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false },
  license_number: { type: DataTypes.STRING, allowNull: false },
  experience_years: { type: DataTypes.INTEGER, defaultValue: 0 },
});

Driver.belongsTo(User, {
  foreignKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
User.hasOne(Driver, { foreignKey: "id" });

module.exports = Driver;
