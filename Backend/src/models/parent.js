const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Parent = sequelize.define(
  "Parent",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false },
  },
  {
    timestamps: false,
  }
);

Parent.belongsTo(User, {
  foreignKey: "id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
User.hasOne(Parent, { foreignKey: "id" });

module.exports = Parent;
